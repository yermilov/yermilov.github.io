import com.sysgears.octopress.deploy.GHPagesDeployer
import com.sysgears.octopress.mapping.ResourceMapper
import com.sysgears.octopress.taglibs.OctopressTagLib


/*
 * Grain configuration.
 */

resource_mapper = new ResourceMapper(site).map
tag_libs = [ OctopressTagLib ]
non_script_files = [ /(?i).*\.(js)$/ ]

features {
    highlight = 'pygments' // 'none', 'pygments'
    markdown = 'txtmark'   // 'txtmark', 'pegdown'
}

environments {
    dev {
        log.info 'Development environment is used'
        url = "http://localhost:${jetty_port}"
        show_unpublished = true
    }
    prod {
        log.info 'Production environment is used'
        url = 'https://yermilov.github.io'
        show_unpublished = false
        features {
            minify_xml = true
            minify_html = true
            minify_js = true
            minify_css = true
        }
    }
    cmd {
        features {
            highlight = 'none'
            compass = 'none'
        }
    }
}

python {
    interpreter = 'jython' // 'auto', 'python', 'jython'
    // cmd_candidates = ['python2', 'python', 'python2.7']
    // setup_tools = '2.1'
}

ruby {
    interpreter = 'jruby'   // 'auto', 'ruby', 'jruby'
    // cmd_candidates = ['ruby', 'ruby1.8.7', 'ruby1.9.3', 'user.home/.rvm/bin/ruby']
    // ruby_gems = '2.2.2'
}

/*
 * Deployment configuration.
 */

// s3_bucket = 'www.example.com'
// s3_deploy_cmd = "s3cmd sync --acl-public --reduced-redundancy ${destination_dir}/ s3://${s3_bucket}/"

// rsync_ssh_user = 'user@example.com'
// rsync_ssh_port = '22'
// rsync_document_root = '~/public_html/'
// rsync_deploy_cmd = "rsync -avze 'ssh -p ${rsync_ssh_port}' --delete ${destination_dir} ${rsync_ssh_user}:${rsync_document_root}"

gh_pages_url = 'git@github.com:yermilov/yermilov.github.io.git'
github_pages_deploy_cmd = new GHPagesDeployer(site).deploy

deploy = github_pages_deploy_cmd

/*
 * Site configuration.
 */

title = 'Development notes by Yaroslav Yermilov'
subtitle = 'remember kids, the only difference between screwing around and science is writing it down'
author = 'Yaroslav Yermilov'
meta_description = 'development notes by Yaroslav Yermilov'
github_repository = 'https://github.com/yermilov/yermilov.github.io'

// Blog and Archive
posts_per_blog_page = 5             // the number of posts to display per blog page
posts_per_archive_page = 10         // the number of posts to display per archive page

disqus {
    short_name = 'yermilov-github-io'
}

// RSS feed.
rss {
    feed = 'atom.xml'               // url to blog RSS feed
    email = ''                      // email address for the RSS feed
    post_count = 20                 // the number of posts in the RSS feed
}

// Site Search.
enable_site_search = false           // defines whether to enable site search

// Subscription by email.
subscribe_url = ''                  // url to subscribe by email (service integration required)

// Google Analytics.
google_analytics_tracking_id = 'UA-91383043-1'

// Sharing.
sharing {
    // Button for sharing of posts and pages on Twitter.
    twitter {
        share_button {
            enabled = true
            lang = 'en'
        }
    }
    // Button for sharing of posts and pages on Facebook.
    facebook {
        share_button {
            enabled = true
            lang = 'en_US'          // locale code e.g. 'en_US', 'en_GB', etc.
        }
    }
}

// Sidebar modules that should be included by default.
default_asides = [
        'asides/recent_posts.html',
        'asides/recent_updates.html',
        'asides/tweets.html'
]

asides {

    // Recent posts.
    recent_posts {
        count = 5
    }

    // Recent posts.
    recent_updates {
        count = 3
    }

    // The latest tweets.
    tweets {
        user = 'yermilov17'
    }
}

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


      ++++
      <!--more-->
      ++++
      """.readLines().collect({ it.trim() }).dropWhile({ it.length() == 0 }).join('\n')
    )
}

def publishPost = { String postTitleSuffix ->
    def blogDir = new File("${content_dir}/blog/")

    def files = blogDir.listFiles().findAll({ it.name.startsWith(postTitleSuffix) })
    if (files.size() == 0) {
        throw new IllegalArgumentException("There are no files named $postTitleSuffix: $files")
    }
    if (files.size() > 1) {
        throw new IllegalArgumentException("There are more that one file named $postTitleSuffix: $files")
    }

    def file = files.first()
    String originalDate = file.name.substring(0, 10)

    def date = new Date()
    def publishDate = date.format('yyyy-MM-dd')
    def publishFileName = publishDate + file.name.substring(10)

    def publishFile = new File(blogDir, publishFileName)
    file.renameTo(publishFile)

    def imagesDir = new File("${content_dir}/images/").listFiles().find({ it.name.startsWith(postTitleSuffix) })
    imagesDir.renameTo(new File("${content_dir}/images/", imagesDir.name.replace(originalDate, publishDate)))

    publishFile.text = publishFile.text.replace(originalDate, publishDate)
    publishFile.text = publishFile.text.replace('published: false', 'published: true')

    int datesStartIndex = publishFile.text.indexOf('date: "')
    int datesEndIndex = publishFile.text.indexOf('categories: [')

    publishFile.text = """${publishFile.text.substring(0, datesStartIndex)}date: "${date.format(datetime_format)}"
updated: "${date.format(datetime_format)}"
${publishFile.text.substring(datesEndIndex)}"""
}

commands = [
'create-post': createPost,
'publish-post': publishPost
]
