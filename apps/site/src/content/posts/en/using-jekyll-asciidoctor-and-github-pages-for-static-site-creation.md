---
title: "Using Jekyll, Asciidoctor and GitHub Pages for Static Site Creation"
canonicalSlug: "using-jekyll-asciidoctor-and-github-pages-for-static-site-creation"
language: "en"
publishedAt: 2017-02-20
summary: "After I decided to start write things down, the first tool that I found for this task was Jekyll - a static site generator supported by GitHub Pages."
tags: []
translations:
  en: "using-jekyll-asciidoctor-and-github-pages-for-static-site-creation"
coverImage: "/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/01.png"
---
After I decided to start write things down, the first tool that I found for this task was Jekyll - a static site generator supported by GitHub Pages. It was very useful for creating the first version of this blog, but finally, I decided to use Grain (hope to present it in the following article). As a result of playing with Jekyll, in this article I will show how to build a simple blog using Jekyll as static site generator, GitHub Pages as static site server and Asciidoc as markdown language. We will create a blog from scratch, add new posts and change default configuration and web pages layout using mentioned technologies.

## Why static matters?

The web started as a bunch of static sites that provided various pieces of useful information for first explorers of the internet. But it turned into civilization phenomenon with exponential growth only when it became dynamic with all Web 2.0 stuff like social media, wikis, media platforms, etc.

Anyway, even today lots of web resources really need a very limited amount of dynamic magic. If client state on your site is not persisted, it can be handled by JavaScript locally. If content is changing relatively rarely, you can just redeploy it with every change. If you need something like commenting feature, you can rely on external resources (for example [disqus.com](https://disqus.com) in this case).

And if you get rid of all heavy dynamic weapons like databases and server-side code and express your site as a collection of HMTL, CSS and JavaScript files you can gain some very worthy benefits. The first and the main one is the ease of site deployment. All you need to do is copy your files into any kind of web server (Apache, Nginx). And if you go further and use cloud file storage (like S3) or dedicated web platform (like GitHub Pages), you get even more (think how it can help you in content management, content delivery, maintenance simplicity, performance, and security).

## Who is Jekyll?

![jekyll ab698 ab69891f3e58371ac378b226143fa763](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/01.png)
*source*

[Jekyll](https://jekyllrb.com) is a static site generator written in Ruby. Actually what it does is taking your content along with the desired layout and transform them into a collection of HTML, CSS and JavaScript files ready for deployment and servicing as a static web resource. Content can be provided in any form from plain text files or markdown to pieces of HTMLs. The layout is specified as the name of one of the ready-to-go layouts Jekyll provides (with customization possibilities) or as your own HTML, CSS, and JavaScript files with template-related features.

![jekyll ecef3 ecef3ed5e49ee2c1093d722619911c85](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/02.png)

Moreover, Jekyll is a great example of the tool with both comprehensive predefined conventions and almost endless customization possibilities. If all you need is a simple blog, you should just place you text-file posts named in a special way into the special directory, define few configuration parameters and you’re done. If you need something more specific, you can include your own pieces of HTML, CSS or JavaScript anywhere you need, even using Jekyll as just template engine for your sources ignoring all other features.

## So, all I need is a simple blog

Check [Jekyll quick-start guide](https://jekyllrb.com/docs/quickstart)! You need to follow these 5 steps:

1.  Install [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
    
2.  Execute `gem install jekyll bundler`
    
3.  Execute `jekyll new myblog`
    
4.  Execute `cd myblog; bundle exec jekyll serve`
    
5.  Go to [http://localhost:4000](http://localhost:4000)
    

You should get result same as [this one](https://yermilov.github.io/jekyll-start/):

![jekyll 707aa 707aab07625a4434b996c11a11c9a6ba](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/03.png)

However, you can do the same even without installing Ruby and Jekyll itself. First, you need to fork repository or download sources from [mini-jekyll repository](https://github.com/yermilov/mini-jekyll), or, as an alternative, you can quickly create them by yourself:

1.  Create directory for your blog
    
2.  Create file \_config.yml with the following content
    

```yaml
title: Your awesome title
theme: minima
exclude:
  - Gemfile
```

3.  Create file Gemfile with the following content
    

```ruby
source "https://rubygems.org"
ruby RUBY_VERSION

gem "jekyll", "3.4.0"
gem "minima", "~> 2.0"
```

4.  Create file index.md with the following content
    

```
---
layout: home
---
```

5.  Create file about.md with following content
    

```
---
layout: page
title: About
permalink: /about/
---

This is the very minimum viable Jekyll blog!
```

6.  Create file \_posts/2017-02-20-welcome-to-mini-jekyll.md with following content:
    

```
---
layout: post
title:  "Welcome to Mini-Jekyll!"
---
```

var today = new Date(); var dd = today.getDate(); var mm = today.getMonth() + 1; //January is 0! var yyyy = today.getFullYear(); if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm } today = yyyy + '-' + mm + '-' + dd; document.getElementById('todayFileName').innerHTML = '\_posts/' + today + '-welcome-to-mini-jekyll.md'

How can you start this site without even installing Jekyll? Easily, with support of [GitHub Pages](https://pages.github.com/) - web platform that serves static content from GitHub repositories. Besides just showing content as it is, GitHub Pages can determine that your repository contains Jekyll project, render it and serve result.

![jekyll e5cd5 e5cd5a4b237fae4edc9efc449ec92f97](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/04.png)

All you need to do is:

1.  [Create new GitHub repository](https://github.com/new)
    
2.  Execute `git init` inside your local blog directory
    
3.  Execute `git add .`
    
4.  Execute `git commit -m 'initial blog commit'`
    
5.  Execute `git remote add origin [https://github.com/yermilov/mini-jekyll.git](https://github.com/yermilov/mini-jekyll.git)` (substitute URL with yours)
    
6.  Execute `git push -u origin gh-pages`
    
7.  Go to [https://yermilov.github.io/mini-jekyll](https://yermilov.github.io/mini-jekyll) (substitute with your github username and repository name)
    

![jekyll 86b33 86b33272473f30136abb8f58bd27abcc](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/05.png)

## Got Jekyll and GitHub Pages. What’s about Asciidoctor?

If you want to create blog for simple text+images posts, you’ve already got a good starting point. But if your blog is going to be developer-oriented, you probably may not be satisfied with using neither markdown nor HTML for your posts. In this case, [Asciidoc](http://asciidoctor.org/docs/what-is-asciidoc/) should be your default choice. It shares the same concept as [Markdown](http://daringfireball.net/projects/markdown/), is partially compatible with it, but has much more powerful features needed for advanced drafting of articles, technical manuals, books, presentations, and prose.

[Asciidoctor](http://asciidoctor.org) is a toolchain that implements Asciidoc format. We are going to integrate it with Jekyll for rendering content using [jekyll-asciidoc plugin](https://github.com/asciidoctor/jekyll-asciidoc).

As a starting point, fork or download sources from [jekyll-asciidoc-quickstart repository](https://github.com/asciidoctor/jekyll-asciidoc-quickstart). The same as before, instead you can download it and create your own repository from scratch with same content.

Unlike previous examples, some additional setup is needed. GitHub Pages does not (yet) support rendering Asciidoc content, so you can’t just push it to GitHub repository and got rendered site back. Luckily, there is an easy way to overcome this problem. However, it will be great to show GitHub demand in Asciidoc rendering for example through [GitHub support form](http://github.com/support).

![jekyll 595ea 595eab93a79c0e1912251cdf8b32edbe](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/06.png)

Actually, we will setup [Travis CI server](https://travis-ci.org/) to emulate GitHub Pages staging automation, and push blog live upon committing any change to the repository. Steps to achieve it are perfectly described in [jekyll-asciidoc plugin documentation](https://github.com/asciidoctor/jekyll-asciidoc-quickstart/blob/master/README.adoc).

![jekyll e1af1 e1af1db7acd5c92a9069103e2d6d7256](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/07.png)

After cloning quickstart repository you need to make two changes in the sources:

1.  Add GitHub personal access token (described [here](https://github.com/asciidoctor/jekyll-asciidoc-quickstart/blob/master/README.adoc#6-encrypt-the-github-token-for-travis-ci)).
    
2.  Modify original *.Rakefile*, to make it possible to use your e-mail for automated pushes to your repository:
    

```
require 'rake-jekyll'

Rake::Jekyll::GitDeployTask.new(:deploy) do |t|
   t.committer = 'Travis <example@gmail.com>' # substitute with your e-mail
end
```

After your push changes into ****develop**** branch (do not use *master* or *gh-pages* because it may cause conflicts), Travis CI automatically will pick up sources, render them using Jekyll and push them back into master or gh-pages branch (depending on GitHub conventions).

Now you can go to [https://yermilov.github.io/jekyll-asciidoc-quickstart](https://yermilov.github.io/jekyll-asciidoc-quickstart) (substitute with your github username and repository name) and enjoy!

![jekyll e7f2b e7f2bd8762f464e3fe2a7f2f3acb50a8](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/08.png)

## Adding new post

The first thing you probably want to do with your blog is to create a new post. To do it, add file named *yyyy-mm-dd-new-post.adoc* (substitute yyyy-mm-dd with publication date and new-post with short post name) with following content:

```
= Post title goes here
:showtitle:
:page-navtitle: Name for posts feed goes here
:page-root: ../../../

Post content goes here
```

![jekyll c5427 c5427c7c2496d42ac1d8b6ff61414a0e](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/09.png)

For quick start with Asciidoc refer to [Writer’s Guide](http://asciidoctor.org/docs/asciidoc-writers-guide/). After it, you can proceed with more advanced [Syntax Quick Reference](http://asciidoctor.org/docs/asciidoc-syntax-quick-reference/) and full [User Manual](http://asciidoctor.org/docs/user-manual/).

Probably, you already have some post on external resources you want to link to your new blog. With Jekyll’s flexibility, this is the matter of two easy steps. First of all, create file that will contain your external post metadata. Name it *yyyy-mm-dd-external-post.**md*** similarly to regular posts.

```
---
navtitle:  "External post"
external_url: https://yermilov.github.io/mini-jekyll/2017/02/10/welcome-to-mini-jekyll.html
---
```

After it, open file **\_layouts/default.html** and do following changes:

```html
- <li><a href=".{{ post.url }}">{{ post.navtitle }}</a></li>

+ <li>
+   {% if post.external_url %}
+       <a href="{{ post.external_url }}">{{ post.navtitle }}</a>
+   {% else %}
+       <a href=".{{ post.url }}">{{ post.navtitle }}</a>
+   {% endif %}
+ </li>
```

Now link in the posts feed is pointing to original external link.

## Improving pages layout

![jekyll 33bb0 33bb0628a770179921350f59ae06896b](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/10.png)

As we have already made a minor change to default page layout in our blog, let’s try some more significant ones, like changing pages layout.

For the starting point, pages layout is pretty straightforward. There is a file named *default.html* in the **\_layouts** folder and it’s used for all site pages. Each page (*index.adoc* or any from the **\_posts** folder) during rendering is placed instead of `{{ content }}` placeholder.

![jekyll 5de01 5de01f5a2d2a2f8b4e4a68955562eef1](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/11.png)

Let’s now split it to different layouts. First, to change home page layout, create file *\_layouts/home.html*:

```html
---
layout: default
---

<div class="row">
    <div class="large-9 columns" role="content">
        <h4>Posts</h4>
        <div class="posts nav">
          {% for post in site.posts %}
            <div>
              <h3>
                {% if post.external_url %}
                  <a href="{{ post.external_url }}">{{ post.navtitle }}</a>
                {% else %}
                  <a href=".{{ post.url }}">{{ post.navtitle }}</a>
                {% endif %}
              </h3>
              {{ post.date | date: "%b %-d, %Y" }}
              {% if post.summary %}
                <p> {{ post.summary }} </p>
              {% endif %}
            </div>
          {% endfor %}
        </div>
    </div>
</div>
```

First 3 lines are YAML configuration of the layout. Here we specify that we want to inherit default layout, which implies placing content of current page instead of `{{ content }}` placeholder.

Now, create file *\_layouts/post.html*. It will be used as layout for all post pages.

```html
---
layout: default
---

<div class="row">

    <!-- Main Blog Content -->

    <div class="large-9 columns" role="content">

        {{ content }}

    </div>

    <!-- End Main Content -->

    <!-- Sidebar -->

    <aside class="large-3 columns">

        <h4>Posts</h4>
        <ul id="posts" class="posts nav">
            {% for post in site.posts limit: 5 %}
                <li>
                  {% if post.external_url %}
                      <a href="{{ post.external_url }}">{{ post.navtitle }}</a>
                  {% else %}
                      <a href=".{{ post.url }}">{{ post.navtitle }}</a>
                  {% endif %}
                </li>
            {% endfor %}
        </ul>

    </aside>

    <!-- End Sidebar -->
</div>
```

Next, modify *\_layouts/default.html*. Do the following change:

```html
- <!-- Main Page Content and Sidebar -->
- ...
- <!-- End Main Content and Sidebar -->

+ <!-- Main Page Content and Sidebar -->
+ {{ content }}
```

After finishing with layout, we need to reconfigure content files. Let’s start from *index.adoc*. Now it can be just:

```
= Congratulations!
:showtitle:
:page-title: Jekyll AsciiDoc Quickstart
:page-description: A forkable blog-ready Jekyll site using AsciiDoc
:page-layout: home
```

Proceed with post files. Regular post should look like:

```
= Post title goes here
:showtitle:
:page-navtitle: Name for posts feed goes here
:page-root: ../../../
:page-layout: post
:page-summary: Post summary for posts feed goes here

Post content goes here
```

External post metadata should look like:

```
---
navtitle:  "External post"
external_url: https://yermilov.github.io/mini-jekyll/2017/02/10/welcome-to-mini-jekyll.html
summary: Remember Mini-Jekyll?
---
```

The last thing we should do in scope of this post is organizing our layout a little bit. For now, our default layout is quite big, let’s split it with help of include feature. As example, we will take page footer.

![jekyll faaab faaabca1ee1e62db70a6b4c9409660d5](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/12.png)

First, create file *\_includes/footer.html* with following content:

```html
<footer class="row">
    <div class="large-12 columns">
        <hr>
        <div class="row">
            <div class="large-12 columns">
              <span>
                {% if site.author %}
                  {{ site.author | escape }}
                {% else %}
                  {{ site.title | escape }}
                {% endif %}
              </span>
              <span>
                {% if site.email %}
                <a href="mailto:{{ site.email }}">{{ site.email }}</a>
                {% endif %}
              </span>
            </div>
        </div>
    </div>
</footer>
```

Next, do the following change with *\_layouts/default.html*:

```html
- <!-- Footer -->
- <footer class="row">
- ...
- </footer>

+ <!-- Footer -->
+ {% include footer.html %}
```

You can notice, that footer uses variables named starting with `site.`. They are taken from *\_config.yml* file. Add two lines to it (substitute with your personal data):

```yaml
author: Yaroslav Yermilov
email: example@gmail.com
```

Now we are done! Let’s examine final result:

![jekyll 350da 350da985b22ab2d3d61f647f644be394](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/13.png)
*Home page*

![jekyll 366e7 366e77e92daa91ca729cf28a15b3acf5](/blog/using-jekyll-asciidoctor-and-github-pages-for-static-site-creation/14.png)
*Post page*

## Links

[Jekyll home](https://jekyllrb.com)

[GitHub Pages home](https://pages.github.com/)

[Mini-Jekyll repository](https://github.com/yermilov/mini-jekyll)

[Markdown home](http://daringfireball.net/projects/markdown/)

[Asciidoctor home](http://asciidoctor.org)

[What is Asciidoc?](http://asciidoctor.org/docs/what-is-asciidoc/)

[Asciidoc Writer’s Guide](http://asciidoctor.org/docs/asciidoc-writers-guide/)

[Asciidoc Syntax Quick Reference](http://asciidoctor.org/docs/asciidoc-syntax-quick-reference/)

[Asciidoctor User Manual](http://asciidoctor.org/docs/user-manual/)

[jekyll-asciidoc plugin home](https://github.com/asciidoctor/jekyll-asciidoc)

[jekyll-asciidoc-quickstart repository](https://github.com/asciidoctor/jekyll-asciidoc-quickstart)