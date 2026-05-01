---
title: "Groovy Static Sites With Grain"
canonicalSlug: "groovy-static-sites-with-grain"
language: "en"
publishedAt: 2017-06-27
summary: "The first option I considered when I decided to start up this blog was to use static site generator, and Jekyll as the most popular one was an obvious choice."
tags: []
translations:
  en: "groovy-static-sites-with-grain"
coverImage: "/blog/groovy-static-sites-with-grain/01.png"
---
The first option I considered when I decided to start up this blog was to use static site generator, and Jekyll as the most popular one was an obvious choice. Shortly after I was ready with the first version of this blog and first post - [Using Jekyll, Asciidoctor and GitHub Pages for static site creation](/en/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/), I’ve noticed a link in [@sdelamo](https://twitter.com/sdelamo) [Groovy Calamary #68](http://groovycalamari.com/issues/68) to the static site generator from Groovy world - [Grain](https://sysgears.com/grain/). As I consider myself as a Groovy ecosystem fan, I could not resist it and quickly migrated this blog to Grain.

## Service site generators

Typical web resource after you request a page from it does something like following:

1.  fetch some data from storage
    
2.  process it
    
3.  select one of web page templates and render it
    
4.  return result
    

Many of them do not require dedicated data storage or data itself is changing relatively rarely. It means that web pages can be generated once and served without no additional processing for every request.

It’s important that we should not return to the boring Web 1.0 world. If client state on your site is not persisted, it can be handled by JavaScript locally. If the content is changing relatively rarely, you can just redeploy it with every change. If you need something like commenting feature, you can rely on external resources (for example [disqus.com](https://disqus.com) in this case).

And if you get rid of all heavy dynamic weapons like databases and server-side code and express your site as a collection of HMTL, CSS and JavaScript files you can gain some good benefits: ease of site deployment, content caching and delivering (which leads to better performance) and security management.

Typical static site generator takes your content (it can be plain text file, markdown, asciidoc, etc.) along with bunch of configuration parameters and the desired layout (usually HTML with some kind of template DSL) and transform them into a collection of HTML, CSS and JavaScript files ready for deployment and servicing as a static web resource. According to [staticgen.com](https://www.staticgen.com/), there are dozens of different static sites generators, and [Jekyll](https://jekyllrb.com) is the most popular from them. I’ve already posted an [article](/en/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/) about Jekyll, and today we will look closely at [Grain](https://sysgears.com/grain/), which is a workhorse of this blog itself.

## So, Grain

Grain is an open source static website generator for Groovy. It provides all usual static site generator features and moreover has a particular killer feature - Groovy is a privileged citizen for all kinds of source files (configuration, layout, content and more).

Starting Grain blog is as easy as downloading one of its [themes](https://sysgears.com/grain/themes/). Let’s examine it with yet another blog example, which means [Grain Octopress Theme](https://sysgears.com/grain/themes/octopress/) is theme of our choice. To ensure everything is working open your project directory and execute following:

```shell
./grainw
```

If you open now [http://localhost:4000](http://localhost:4000), you should see following:

![3600d 3600d28dd51938ac3d3da7ec351d3114](/blog/groovy-static-sites-with-grain/01.png)

## Now some housekeeping

Before start using Grain, you need to perform some housekeeping. For example, as Grain try to rely on Groovy ecosystem tool as much as possible, it uses Gradle as build tool. But distribution that we’ve just download uses version 1.8 of Gradle wrapper (for the moment of writing this article 4.0 is actual version). You can easily update it by applying following change to *build.gradle* file:

```diff
- gradleVersion = '1.8'
+ gradleVersion = '4.0'
```

And running following command:

```shell
./gradlew wrapper
```

Also, it would be great to update *.gitignore* file to ignore irrelevant for VCS files as following:

```ignore list
# Intellij #
.idea/
out/
*.iml
*.iws
*.ipr

# Mac #
.DS_Store

# Gradle #
build/
.gradle/

# Grain #
/.sass-cache/
*.dep
/target/

# GitHub #
.travis
```

You should also fix JVM memory configuration in *grainw* files:

```diff
- GRAIN_OPTS="-server -Xmx256M -Xms32M -XX:PermSize=32m -XX:MaxPermSize=128m -Dfile.encoding=UTF-8"
+ GRAIN_OPTS="-server -Xms2048M -Xmx2048M -XX:MaxPermSize=1024M -Dfile.encoding=UTF-8"
```

Modern web requires you to serve all your site content over HTTPS protocol. By default, not all Grain Octopress Theme content complies it. You should edit file *theme/includes/custom/head.html* as following:

```html
<link href="https://fonts.googleapis.com/css?family=PT+Serif:regular,italic,bold,bolditalic" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=PT+Sans:regular,italic,bold,bolditalic" rel="stylesheet" type="text/css">
```

## Adding new post

The first thing you probably want to do with your blog is to create a new post. To do it, add file named *yyyy-mm-dd-new-post.adoc* (substitute yyyy-mm-dd with publication date and new-post with short post name) with following content:

```
---
layout: post
title: "Post title goes here"
date: "2017-05-08 02:30"
categories: [tags]
published: true
---

Post content goes here.
```

As you can see, another great thing about Grain is that it supports [Asciidoc](http://asciidoctor.org/docs/what-is-asciidoc/) format out-of-the-box. It’s a great benefit if your blog is going to be developer-oriented, and you probably may be satisfied with using neither markdown nor HTML for your posts. Asciidoc shares the same concept as [Markdown](http://daringfireball.net/projects/markdown/), is partially compatible with it but has much more powerful features needed for advanced drafting of articles, technical manuals, books, presentations, and prose.

Now your blog should look like following:

![8020f 8020f393565a558551c6c2e341b84c45](/blog/groovy-static-sites-with-grain/02.png)

And if you follow new post link:

![cf787 cf787cc6e036ab60a8b546f9d25019e8](/blog/groovy-static-sites-with-grain/03.png)

As I said in the beginning, Groovy is a privileged citizen in the Grain world. To prove it, in the following sections I will demonstrate simple examples how you can use Groovy in all kinds of site sources - configuration, layout, content and even deployment.

## Site configuration

As you can see, there are plenty of defaults used by your blog now. This problem is easily fixed via *SiteConfig.groovy* file. What is important, is that it is implemented as executable Groovy script, which constructs site build context. Inside it you can:

-   assign primitive values to configuration parameters
    

```groovy
title = 'Your blog title'
```

-   use special Groovy literals like patterns, string templates or lists
    

```groovy
non_script_files = [/(?i).*\.(js)$/]

...
  
s3_deploy_cmd = "s3cmd sync --acl-public --reduced-redundancy ${destination_dir}/ s3://${s3_bucket}/"

...
  
default_asides = ['asides/recent_posts.html', 'asides/bitbucket.html', 'asides/github.html', 'asides/tweets.html', 'asides/delicious.html',
        'asides/pinboard.html', 'asides/about.html', 'asides/facebook.html', 'asides/twitter.html',
        'asides/instagram.html', 'asides/google_plus.html']
```

-   instantiate objects and execute methods on them
    

```groovy
resource_mapper = new ResourceMapper(site).map
```

-   use Groovy builders for hierarchical parameters
    

```groovy
asides {

    recent_posts {
        count = 5
    }

    delicious {
        user = 'user-id' 
        count = 5 
    }

    pinboard {
        user = 'user-id'  
        count = 5  
    }
  
    ...
```

You can find tons of parameters there and even introduce your own. For the beginning, let’s concentrate on the simple ones and perform following changes:

```diff
- title = 'Octopress theme for Grain' // blog name for the header, title and RSS feed
+ title = 'Your blog title'

- subtitle = 'Grain is a static web site building framework for Groovy' // blog brief description for the header
+ subtitle = 'Your blog subtitle'

- author = 'SysGears'                 // author name for Copyright, Metadata and RSS feed
+ author = 'me'

github {
-     user = 'sysgears'           // GitHub (https://github.com/) username
+     user = 'github_profile'

tweets {
-     user = 'sysgears'           // Twitter (https://twitter.com/) username
+     user = 'twitter_profile'

twitter {
-     user = 'sysgears'           // Twitter (https://twitter.com/) username
+     user = 'twitter_profile'
}

facebook {
-     user = 'sysgears'           // Facebook (https://www.facebook.com/) username
+     user = 'facebook_profile'
}
```

Now, your blog should look a little bit more personal:

![0cc17 0cc176f669122a794295dfaf7aca36bc](/blog/groovy-static-sites-with-grain/04.png)

Moreover, you can use `commands` object to create custom commands for grain cli.

```groovy
def createPost = { String postTitle ->
    def date = new Date()
    def fileDate = date.format('yyyy-MM-dd')
    def filename = fileDate + '-' + postTitle.encodeAsSlug() + '.adoc'
    def blogDir = new File("${content_dir}/blog/")
    if (!blogDir.exists()) {
        blogDir.mkdirs()
    }
    def file = new File(blogDir, filename)

    file.exists() || file.write("""
      ---
      layout: post
      title: "${postTitle}"
      date: "${date.format(datetime_format)}"
      updated: "${date.format(datetime_format)}"
      categories: []
      comments: true
      published: false
      sharing: true
      ---
      :linkattrs:

      ${postTitle}

      ++++
      <!--more-->
      ++++
      """.readLines().collect({ it.trim() }).dropWhile({ it.length() == 0 }).join('\n')
    )
}

commands = [
'create-post': createPost
]
```

It means that if you execute `./grainw create-post 'HOWTO: create post from CLI'` you will got following result:

```
---
layout: post
title: "HOWTO: create post from CLI"
date: "2017-06-17 13:24"
updated: "2017-06-17 13:24"
categories: []
comments: true
published: false
sharing: true
---
:linkattrs:

HOWTO: create post from CLI

++++
<!--more-->
++++
```

![ee478 ee4782118817e6e1cf4c09b17cd8cab8](/blog/groovy-static-sites-with-grain/05.png)

## Site layout

Grain has a pretty usual layout system. Let’s explore it using example of *theme/layouts/blog.html* which controls layout of site home page.

```html
---
layout: default
index: true
sidebar: true
---
<div class="blog-index">
  <article>
    <% if (page.title) { %>
        <h1 id="entry-title">${page.title}</h1>
        <% if (page.tag) { %>
        <div class="subscribe">
          <a rel="subscribe-rss" title="Stay tuned to ${page.tag.capitalize()} category via RSS" href="${page.url}${site.rss.feed}">RSS</a>
        </div>
        <% } %>
    <% } %>
    <% page.posts.each { post ->
        def brief = post.render().content.split('<!--more-->').head()
    %>
        ${include "article.html", post + [brief: brief]}
    <% } %>
  </article>
  <div class="pagination">
    <div class="links">
      <% if (page.paginator?.prev_page) { %>
        <a class="prev" href="${link page.paginator.prev_page}">&larr; Newer</a>
      <% } %>
      <% if (page.front) { %>
        <a class="archive" href="${link '/archives/'}">Blog Archives</a>
      <% } %>
      <% if (page.paginator?.next_page) { %>
        <a class="next" href="${link page.paginator.next_page}">Older &rarr;</a>
      <% } %>
    </div>
  </div>
</div>
${include 'sidebar.html'}
```

On the lines 1-5, you can see typical page front matter. First of all, it configures layout inheritance. You can open file named *theme/layouts/default.html*, which is parent layout for *blog.html* and check that *blog.html* content will be put inside `${content}` tag (line 14) of *default.html*:

```html
<!DOCTYPE html>
<!--[if IEMobile 7 ]><html class="no-js iem7"><![endif]-->
<!--[if lt IE 9]><html class="no-js lte-ie8"><![endif]-->
<!--[if (gt IE 8)|(gt IEMobile 7)|!(IEMobile)|!(IE)]><!--><html class="no-js" lang="en"><!--<![endif]-->

${include 'head.html'}

<body ${page.sidebar != false ? '' : "class='no-sidebar'"}
  ${page.sidebar == 'collapse' || site.sidebar == 'collapse' ? "class='collapse-sidebar sidebar-footer'" : ''} >
  <header role="banner">${include 'header.html'}</header>
  <nav role="navigation">${include 'navigation.html'}</nav>
  <div id="main">
    <div id="content">
      ${content}
    </div>
  </div>
  <footer role="contentinfo">${include 'footer.html'}</footer>
  ${include 'after_footer.html'}
</body>

</html>
```

Following lines of front matter are passed into special `page` object and can be used to parametrize layout behavior.

After front matter, we see kind of normal HTML code with addition of Groovy. It can be one-liner, just like in lines 19 and 36. In these concrete example special implicit method `include` is used, which takes another HTML file and optionally parameters map, renders their content and insert into original page.

The more sophisticated option is multi-line Groovy code, which is, however, very natural and clear. You can use `if` statement (like in line 8) to control which parts of page layout should be rendered and which not. As a result, you do not need any special constructions as many other static site generators have. For example, if you require rendering collection of elements, you can use Groovy Collection API like in line 16.

With such approach you can quickly implement some interesting features like in line 17, where you loop through list of blog posts, render content of each one, extract briefs and put them on your home page.

## Site content

Just like with layout files you can simply put any Groovy code anywhere in your content file. For example, if you modify latest generated post as following:

```
---
layout: post
title: "HOWTO: create post from CLI"
date: "2017-06-17 13:24"
updated: "2017-06-17 13:24"
categories: []
comments: true
published: false
sharing: true
---
:linkattrs:

HOWTO: create post from CLI

++++
<!--more-->
++++

${ new Date() }
```

You will get something like:

![05279 05279b8895a2b4ce8c0efb67f7a9f307](/blog/groovy-static-sites-with-grain/06.png)

Pay attention that this code will be executed once and its result will be put into static HTML page. If you need dynamic behavior you will probable need something like:

```
---
layout: post
title: "HOWTO: create post from CLI"
date: "2017-06-17 13:24"
updated: "2017-06-17 13:24"
categories: []
comments: true
published: false
sharing: true
---
:linkattrs:

HOWTO: create post from CLI

++++
<!--more-->
++++

+++<span id="todayPlaceholder"></span>+++

++++
<script>
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
      dd = '0' + dd
  }

  if (mm < 10) {
      mm = '0' + mm
  }

  document.getElementById('todayPlaceholder').innerHTML = yyyy + '-' + mm + '-' + dd;
</script>
++++
```

If you need to reuse some code in multiple places, there is an excellent feature called custom tags in Grain. If you have an experience with template frameworks like JSP, you can find something familiar in it. As reference, open file *\\theme\\src\\com\\sysgears\\octopress\\taglibs\\OctopressTagLib.groovy* which already contains several very useful tags like `gist` or `img`. As you can see, custom tag is as simple as Groovy closure and HTML template so that we can implement our own in 3 minutes.

First, add following closure to *\\theme\\src\\com\\sysgears\\octopress\\taglibs\\OctopressTagLib.groovy*:

```groovy
def dateNow = { Map attrs ->
    if (!attrs.sel) throw new IllegalArgumentException('Tag [dateNow] is missing required attribute [sel]')

    taglib.include('/tags/dateNow.html', [sel: attrs.sel])
}
```

Then, create new file *\\theme\\includes\\tags\\dateNow.html* with following content:

```html
<script>
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if (dd < 10) {
      dd = '0' + dd
  }

  if (mm < 10) {
      mm = '0' + mm
  }

  document.getElementById('${ page.sel }').innerHTML = yyyy + '-' + mm + '-' + dd;
</script>
```

And last, modify your content page:

```
---
layout: post
title: "HOWTO: create post from CLI"
date: "2017-06-17 13:24"
updated: "2017-06-17 13:24"
categories: []
comments: true
published: false
sharing: true
---
:linkattrs:

HOWTO: create post from CLI

++++
<!--more-->
++++

+++<p><span>Hello from </span><span id="todayPlaceholder"></span></p>+++

++++
${ dateNow sel:'todayPlaceholder' }
++++
```

Ready! You will get something like:

![22b63 77df0a95716854e6fd110dd4d29c2a14](/blog/groovy-static-sites-with-grain/07.png)

## Deployment to GitHub Pages

Now, it’s time to finalize all our efforts and publish results of our work to the internet. It can be achieved easily with support of [GitHub Pages](https://pages.github.com/) - web platform that serves static content from GitHub repositories. If you put some static resources to your repository branch named *gh-pages*, GitHub Pages will automatically serve it as web resource.

So, first obvious option is to run `./grainw generate` and push content of *dist* folder to the *gh-pages* branch of your repository manually. But it is so boring!

Let’s rather set up automatic pipeline: [Travis CI job](https://travis-ci.org/) which will be started automatically by each commit to *develop* branch, and actually do the same: run `./grainw generate` and push content of *dist* folder to the *gh-pages* branch from the same repository.

The first thing we need to do - generate key pair, so Travis job will have permissions to push to your repository. To achieve it just run `ssh-keygen -t rsa` in your shell. Then, go to [GitHub settings page](https://github.com/settings/keys), and register new SSH key by providing its public part.

Next, create file *.travis.yml* to configure Travis job with following content:

```yaml
sudo: required

language: java

before_cache:
- rm -f  $HOME/.gradle/caches/modules-2/modules-2.lock
- rm -fr $HOME/.gradle/caches/*/plugin-resolution/

cache:
  directories:
  - "$HOME/.gradle/caches/"
  - "$HOME/.gradle/wrapper/"
  - "$HOME/.grain/packages/"
  - "$HOME/.grain/tools/"

before_install:
- mkdir .travis
- chmod +x gradlew
- chmod +x grainw

install:
- "./grainw generate"

before_script:
- eval "$(ssh-agent -s)"
- chmod 600 .travis/id_rsa
- ssh-add .travis/id_rsa
- git config --global user.email "your_email@gmail.com"
- git config --global user.name "Travis-CI"

script:
- "./grainw deploy"
```

Don’t forget to enable your repository build at [Travis dashboard](https://travis-ci.org/profile/).

As you can see, Travis is supposed to take private part of your generated key from *.travis/* directory. But surely it’s not safe to put something private into public GitHub repository. Luckily enough, Travis supports file encryption. All you need is to run `travis encrypt-file .travis/id_rsa --add`. But it’s important to know two tweaks regarding this command: first, be careful enough to commit encrypted file *id\_rsa.enc* instead of original *.travis/id\_rsa* and second - this command does not work on Windows boxes, you need a \*nix one.

As you can see, there is almost no manual scripting for interaction with git in job definition. The reason is that grain has special `grainw deploy` command which will invoke *\\theme\\src\\com\\sysgears\\octopress\\deploy\\GHPagesDeployer.groovy* script. It works fine with manual deployment process but needs some improvements to integrate with Travis. You can take desired code here:

```groovy
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
            git(['add', '-A'])
            git(['commit', '-m', commitMessage()])
            git(['push', 'origin', "$workingBranch:$workingBranch"])
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
}
```

*GHPagesDeployer* script is instantiated in *SiteConfig* script we already seen. You need to configure it, by providing single parameter inside *SiteConfig.groovy* file:

```groovy
gh_pages_url = '' // path to GitHub repository in format git@github.com:{username}/{repo}.git
```

The last thing you should do is to go to the setting of your Travis job and enable *Build only if .travis.yml is present* to prevent Travis from running build for *gh-pages* branch. Now you can push your latest changes to GitHub and watch how they will be processed by Travis job.

![19ae2 19ae2566e5deb30c71da1348d45182f1](/blog/groovy-static-sites-with-grain/08.png)

If you’ve done everything correctly, you should get the same result as I have here - [https://yermilov.github.io/grain-example](https://yermilov.github.io/grain-example/) (sources can be examined [here](https://github.com/yermilov/grain-example)).

## Links

[Top Open-Source Static Site Generators](https://www.staticgen.com/)

[Jekyll’s home](https://jekyllrb.com)

[Using Jekyll, Asciidoctor and GitHub Pages for static site creation](/en/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/)

[Grain’s home](https://sysgears.com/grain/)

[Sample repository](https://github.com/yermilov/grain-example)

[Markdown home](http://daringfireball.net/projects/markdown/)

[Asciidoctor home](http://asciidoctor.org)

[What is Asciidoc?](http://asciidoctor.org/docs/what-is-asciidoc/)

[Asciidoc Writer’s Guide](http://asciidoctor.org/docs/asciidoc-writers-guide/)

[Asciidoc Syntax Quick Reference](http://asciidoctor.org/docs/asciidoc-syntax-quick-reference/)

[Asciidoctor User Manual](http://asciidoctor.org/docs/user-manual/)

[GitHub Pages home](https://pages.github.com/)

[Travis CI](https://travis-ci.org/)