package com.sysgears.octopress.deploy

import com.sysgears.grain.taglib.Site

/**
 * Provides deploying of the generated site to GitHub Pages service.
 */
class GHPagesDeployer {

    /**
     * Site reference, provides access to site configuration.
     */
    private final Site site

    public GHPagesDeployer(Site site) {
        this.site = site
    }

    /**
     * Deploys generated site.
     */
    def deploy = {
        def cacheDir = site.cache_dir
        def destinationDir = site.destination_dir
        def ghPagesUrl = site.gh_pages_url

        def ant = new AntBuilder()

        if (!ghPagesUrl) {
            ant.echo('Couldn\'t upload to GitHub Pages, please specify your GitHub repo url first')
            return
        }

        def isUserPage = ghPagesUrl.toString().endsWith('.github.io.git')
        def workingBranch = isUserPage ? 'master' : 'gh-pages'
        def cacheDeployDir = "$cacheDir/gh-deploy"

        def workingBranchExists = workingBranchExists(ant, workingBranch, ghPagesUrl)

        def git = { List args ->
            ant.echo("Executing... git ${args.join(' ')}")
            ant.exec(executable: 'git', dir: cacheDeployDir) {
                args.collect { arg(value: it) }
            }
        }

        ant.sequential {
            ant.delete(dir: cacheDeployDir, failonerror: false)
            ant.mkdir(dir: cacheDeployDir)
            git(['init'])
            if (workingBranchExists) {
                git(['remote', 'add', '-t', workingBranch, '-f', 'origin', ghPagesUrl])
                git(['checkout', workingBranch])
                ant.delete(includeEmptyDirs: true) {
                    fileset(dir: cacheDeployDir) {
                        exclude(name: '.git')
                    }
                }
            } else {
                git(['remote', 'add', '-f', 'origin', ghPagesUrl])
                git(['checkout', '--orphan', workingBranch])
            }
            ant.copy(todir: cacheDeployDir) {
                fileset(dir: destinationDir)
            }
            git(['add', '--all', '.'])
        }

        def filesToBeDeleted = getListOfDeletedFiles(ant, cacheDeployDir)

        def continueDeploy = filesToBeDeleted.isEmpty() ?: askContinueDeploy(ant, filesToBeDeleted)

        ant.sequential {
            if (continueDeploy) {
                if (!filesToBeDeleted.isEmpty()) {
                    git(['add', '--all', '-u'])
                }
                git(['commit', '-m', commitMessage()])
                git(['push', 'origin', "$workingBranch:$workingBranch"])
            }
            ant.delete(dir: cacheDeployDir)
        }
    }

    private String commitMessage() {
        if (System.getenv('TRAVIS') == 'true') {
            String travisBuildNumber = System.getenv('TRAVIS_BUILD_NUMBER')
            String travisCommit = System.getenv('TRAVIS_COMMIT')
            String travisCommitMessage = System.getenv('TRAVIS_COMMIT_MESSAGE')

            return "deployed build-${travisBuildNumber} by Travis-CI from ${travisCommit} (${travisCommitMessage})"
        } else {
            String hostname = System.getenv('HOSTNAME') ?: System.getenv('COMPUTERNAME')

            return "deployed from `grain deploy`${hostname ? ' by ' + hostname : ''}"
        }
    }

    /**
     * Determines whether working branch exists for given repo.
     *
     * @param ant AntBuilder instance
     * @param workingBranch working branch name
     * @param ghPagesUrl GitHub repo url
     * @return true if branch exists, false otherwise
     */
    private def workingBranchExists(AntBuilder ant, String workingBranch, String ghPagesUrl) {
        ant.exec(executable: 'git', outputproperty: 'gitLsOutput') {
            ['ls-remote', '--heads', ghPagesUrl].collect { arg(value: it) }
        }
        ant.project.properties.gitLsOutput.contains("refs/heads/$workingBranch")
    }

    /**
     * Returns the list of files to be deleted after deploy.
     *
     * @param ant AntBuilder instance
     * @param cacheDeployDir cache deploy dir
     * @return list of files
     */
    private def getListOfDeletedFiles(AntBuilder ant, String cacheDeployDir) {
        ant.exec(executable: 'git', outputproperty: 'gitStatusOutput', dir: cacheDeployDir) {
            arg(value: 'status')
        }
        def gStatus = ant.project.properties.gitStatusOutput
        def filesToBeDeleted = []
        gStatus.eachLine {
            def matcher = it =~ /#\s+deleted:\s+(.+)/
            if (matcher.matches()) {
                filesToBeDeleted << matcher[0][1]
            }
        }

        filesToBeDeleted
    }

    /**
     * Asks whether user wants to continue deploy.
     *
     * @param ant AntBuilder instance
     * @param filesToBeDeleted list of the files to be removed
     * @return true, if user confirms he wants to continue deploy, false otherwise
     */
    private def askContinueDeploy(AntBuilder ant, List filesToBeDeleted) {
        def fileList = new StringBuilder()
        filesToBeDeleted.each { fileList << "$it\n" }
        def message = "Files to be deleted from the repo:\n${fileList}Сontinue deploy?"
        ant.input(message: message, validargs: 'y,n', addProperty: 'answer')
        def answer = ant.project.properties.answer
        answer.equals('y')
    }
}
