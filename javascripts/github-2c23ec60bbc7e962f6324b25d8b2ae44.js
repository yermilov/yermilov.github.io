var github=(function(){function a(c){return $("<div/>").text(c).html()}function b(g,f){var e=0,c="",d=$(g)[0];for(e=0;e<f.length;e++){c+='<li><a href="'+f[e].html_url+'">'+f[e].name+"</a><p>"+a(f[e].description||"")+"</p></li>"}d.innerHTML=c}return{showRepos:function(c){$.ajax({url:"https://api.github.com/users/"+c.user+"/repos?sort=pushed&callback=?",dataType:"jsonp",error:function(d){$(c.target+" li.loading").addClass("error").text("Error loading feed")},success:function(f){var e=[];if(!f||!f.data){return}for(var d=0;d<f.data.length;d++){if(c.skip_forks&&f.data[d].fork){continue}e.push(f.data[d])}if(c.count){e.splice(c.count)}b(c.target,e)}})}}})();