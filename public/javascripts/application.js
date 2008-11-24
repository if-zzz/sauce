$(document).observe('dom:loaded',function(){
    //empty page
    var is_empty_page = function(){
        return $('empty');
    };
    if(is_empty_page()){
        return;
    }
        
    //intro
    if(window.location.href.match(/\?unset$/))
        Cookie.unset('intro_displayed');
    if(!Cookie.get('intro_displayed')){
        Cookie.set('intro_displayed',true);
        var intro_container = $('intro');
        intro_container.show();
        $('tutorial').show();
        var title_fader = new Fx.Opacity($('intro_title'),{
          duration: 750
        });
        var container_fader = new Fx.Opacity(intro_container,{
          duration: 500
        });
        setTimeout(function(){
          title_fader.toggle();
        },2500);
        setTimeout(function(){
          container_fader.toggle();
        },3250);
        setTimeout(function(){
          intro_container.remove();
        },3750);
        setTimeout(function(){
            show_tutorial();
        },1);
    }
    
    //front page
    var is_front_page = function(){
        return $('about');
    };
    
    var get_latest_collections = function(){
        return $$('#latest .item a');
    };
    var attach_latest_collection_behaviors = function(){
        get_latest_collections().each(function(latest_collection){
            latest_collection.observe('click',function(event){
                collections.select('li a').each(function(a){
                    if(a.href == latest_collection.href)
                        activate_collection(a.up('li'));
                });
                event.stop();
            });
        });
    };
    var detach_latest_collection_behaviors = function(){
        get_latest_collections().invoke('stopObserving','click');
    };
    if(is_front_page())
        attach_latest_collection_behaviors();
        
    //nsfw
    if(window.location.href.match(/\?unset$/))
        Cookie.unset('nsfw_displayed');
    
    var nsfw_active = false;
    
    var get_nsfw_container = function(){
        return $(document.body).select('.nsfw').last();
    };
    
    var hide_nsfw = function(proceed){
        var nsfw = get_nsfw_container();
        if(nsfw){
            var nsfw_fader = new Fx.Opacity(nsfw,{
                duration: 500,
                onComplete: proceed || function(){}
            });
            nsfw_fader.custom(1,0);
        }
    };
    
    var test_nsfw = function(){
        var nsfw = get_nsfw_container();
        if(nsfw && Cookie.get('nsfw_displayed')){
            nsfw.remove();
            return true;
        }else{
            return false;
        }
    };
    
    var show_nsfw = function(){
        var nsfw = get_nsfw_container();
        if(nsfw){
            nsfw.show();
        }
    };
    
    var get_nsfw_proceed_link = function(){
        return $(document.body).down('.nsfw a');
    };
    
    var attach_nsfw_handlers = function(){
        var nsfw = get_nsfw_container();
        if(nsfw){
            if(!test_nsfw()){
                nsfw_active = true;
                get_nsfw_proceed_link().observe('click',function(){
                    nsfw_active = false;
                    hide_nsfw();
                    Cookie.set('nsfw_displayed',true);
                });
            }
        }
    };
    attach_nsfw_handlers();
    
    //indicator
    var indicator = $('indicator');
    var indicator_visible = false;
    var indicator_fader = new Fx.Opacity(indicator,{
        duration: 250
    });
    indicator_fader.hide();
    var show_indicator_timeout;
    var show_indicator = function(timeout_length){
        clearTimeout(show_indicator_timeout);
        show_indicator_timeout = setTimeout(function(){
            indicator_fader.custom(0,1);
            indicator_visible = true;
        },timeout_length || 1000);
    };
    var hide_indicator = function(){
        clearTimeout(show_indicator_timeout);
        if(!indicator_visible)
            return;
        indicator_fader.custom(1,0);
        indicator_visible = false;
    };
    
    //image preloading
    var loaded_images = {};
    var check_if_image_is_loaded = function(image,proceed){
        if(image.complete){
            loaded_images[image.src] = true;
            if(proceed)
                proceed(image);
        }else{
            setTimeout(function(){
                check_if_image_is_loaded(image,proceed);
            },50);
        }
    };
    
    var load_image = function(src,proceed){
        if(loaded_images[src]){
            if(proceed)
                proceed();
            return;
        }
        var image = new Image();
        image.src = src;
        check_if_image_is_loaded(image,proceed);
    };
    
    var get_next_image = function(){
        return $(document.body).down('.next_photo');
    };
    
    var get_previous_image = function(){
        return $(document.body).down('.previous_photo');
    };
    
    var load_next_image = function(proceed){
        var next_image = get_next_image();
        if(next_image){
            load_image(next_image.src,proceed);
        }
    };
    
    var load_previous_image = function(proceed){
        var previous_image = get_previous_image();
        if(previous_image){
            load_image(previous_image.src,proceed);
        }
    };
    
    load_next_image();
    load_previous_image();
    
    //next and previous links
    var get_next_link = function(){
        return $(document.body).down('.next a');
    };
    
    var get_previous_link = function(){
        return $(document.body).down('.previous a');
    };
    
    //page transitions
    var page_transition_active = false;
    var go_to_page = function(page,proceed,proceed_2){
        if(nsfw_active)
            return;
        if(page_transition_active)
            return false;
        page_transition_active = true;
        new Ajax.Request(page,{
            evalScripts: false,
            onException: function(e){
                console.log(arguments)
            },
            onComplete: function(request){
                var tmp = new Element('div',{
                    style: 'display:none'
                });
                var body;
                $(document.body).insert(tmp);
                tmp.update(request.responseText);
                if(tmp.down('#main')){
                    body = tmp.down('#main').innerHTML;
                }else{
                    body = request.responseText;
                }
                tmp.remove();   
                if(proceed)
                    proceed();
                display_page(body);
                if(proceed_2)
                    proceed_2();
            }
        });
    };
    
    var set_title = function(text){
        document.title = document.title.replace(/^((.+)\: )?Saucy Tiger Studios/,(text != '' ? text + ' : Saucy Tiger Studios' : 'Saucy Tiger Studios'));
    };
    
    var display_page = function(html){
        var was_front_page = is_front_page();
        if(was_front_page)
            detach_latest_collection_behaviors();
        detach_box_shadow();
        if(get_next_collection_link())
            get_next_collection_link().remove();
        if(get_previous_collection_link())
            get_previous_collection_link().remove();
        var main = $('main');
        if(was_front_page){
            main.update('');
        }
        main.insert(html);
        attach_nsfw_handlers();
        var photos = main.select('table.photo');
        var info_boxes = main.select('table.info');
        var new_info = info_boxes.last();
        var old_info = info_boxes.first();
        var new_photo = photos.last();
        var old_photo = photos.first();
        new_photo.setStyle({
            zIndex: 2,
            position: 'absolute',
            top: 0,
            left: 0
        });
        var old_photo_fader = new Fx.Opacity(old_photo,{
          duration: 450
        });
        var new_photo_fader = new Fx.Opacity(new_photo,{
          duration: 451,
          onComplete: function(){
              if(!was_front_page){
                  detach_next_link_behaviors();
                  detach_previous_link_behaviors();
                  old_photo.remove();
                  old_info.remove();
                  detach_next_collection_link_behaviors();
                  detach_previous_collection_link_behaviors();
              }
              new_photo.setStyle({
                  position: null,
                  zIndex: null,
                  top: null,
                  left: null
              });
              attach_next_link_behaviors();
              attach_previous_link_behaviors();
              attach_next_collection_link_behaviors();
              attach_previous_collection_link_behaviors();
              load_next_image();
              load_previous_image();
              page_transition_active = false;
              attach_box_shadow();
          }
        });
        if(was_front_page && navigation_visible)
            navigation_fade();
        if(is_front_page()){
            old_photo_fader.custom(1,0);
            setTimeout(function(){
                new_photo_fader.options.onComplete();
            },452);
            old_info.hide();
        }else{
            new_photo_fader.hide();
            new_photo_fader.custom(0,1);
            if(!was_front_page){
                old_photo_fader.custom(1,0);
                old_info.hide();
            }
        }
        if(is_front_page())
            set_title('');
        else
            set_title($(document.body).select('.info .left b').last().innerHTML)
    };
    
    var attach_box_shadow = function(){
        if(Prototype.Browser.WebKit){
            var photo = $(document.body).down('.photo .photo_cell img');
            if(photo){
                photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.03)';
                setTimeout(function(){photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.06)';},50);
                setTimeout(function(){photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.09)';},100);
                setTimeout(function(){photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.12)';},150);
            }
        }
    };
    attach_box_shadow();
    
    var detach_box_shadow = function(){
        if(Prototype.Browser.WebKit){        
            var photo = $(document.body).down('.photo .photo_cell img');
            if(photo){
                photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.09)';
                setTimeout(function(){photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.06)';},50);
                setTimeout(function(){photo.style['-webkit-box-shadow'] = '0px 0px 10px rgba(0, 0, 0, 0.03)';},100);
                setTimeout(function(){photo.style['-webkit-box-shadow'] = null;},150);
            }
        }
    };
    
    var go_to_next_page = function(){
        var next_link = get_next_link();
        if(next_link){
            var next_image = get_next_image();
            show_indicator();
            load_image(next_image.src,function(){
                hide_indicator();
                go_to_page(next_link.href);
            });
        }
    };
    
    var go_to_previous_page = function(){
        var previous_link = get_previous_link();
        if(previous_link){
            var previous_image = get_previous_image();
            show_indicator();
            load_image(previous_image.src,function(){
                hide_indicator();
                go_to_page(previous_link.href);
            });
        }
    };
    
    var attach_next_link_behaviors = function(){
        var next_link = get_next_link();
        if(next_link){
            next_link.observe('click',function(event){
                go_to_next_page();
                event.stop();
            });
        }
    };
    attach_next_link_behaviors();
    
    var attach_previous_link_behaviors = function(){
        var previous_link = get_previous_link();
        if(previous_link){
            previous_link.observe('click',function(event){
                go_to_previous_page();
                event.stop();
            });
        }
    };
    attach_previous_link_behaviors();
    
    var detach_next_link_behaviors = function(){
        var next_link = get_next_link();
        if(next_link){
            next_link.stopObserving('click');
        }
    };
    
    var detach_previous_link_behaviors = function(){
        var previous_link = get_previous_link();
        if(previous_link){
            previous_link.stopObserving('click');
        }
    };
    
    var get_next_collection_link = function(){
        return $(document.body).down('.next_collection');
    };
    
    var get_previous_collection_link = function(){
        return $(document.body).down('.previous_collection');
    };
    
    var attach_previous_collection_link_behaviors = function(){
        var previous_collection_link = get_previous_collection_link();
        if(previous_collection_link){
            previous_collection_link.observe('click',function(event){
                collections.select('li a').each(function(a){
                    if(a.href == previous_collection_link.href)
                        activate_collection(a.up('li'));
                });
                event.stop();
            });
        }
    };
    attach_previous_collection_link_behaviors();
    
    var attach_next_collection_link_behaviors = function(){
        var next_collection_link = get_next_collection_link();
        if(next_collection_link){
            next_collection_link.observe('click',function(event){
                collections.select('li a').each(function(a){
                    if(a.href == next_collection_link.href)
                        activate_collection(a.up('li'));
                });
                event.stop();
            });
        }
    };
    attach_next_collection_link_behaviors();
    
    var detach_previous_collection_link_behaviors = function(){
        var previous_collection_link = get_previous_collection_link();
        if(previous_collection_link){
            previous_collection_link.stopObserving('click');
        }
    };
    
    var detach_next_collection_link_behaviors = function(){
        var next_collection_link = get_next_collection_link();
        if(next_collection_link){
            next_collection_link.stopObserving('click');
        }
    };
    
    
    //keyboard navigation
    var display_invalid_action = function(direction){
        if($(document.body).down('.invalid_action.' + direction))
            return;
        var invalid_action = new Element('div',{
            className: 'invalid_action ' + direction
        });
        var invalid_action_fader = new Fx.Opacity(invalid_action,{
            duration: 125
        });
        invalid_action_fader.hide();
        $('main').insert(invalid_action);
        invalid_action_fader.custom(0,1);
        setTimeout(function(){
            invalid_action_fader.custom(1,0);
        },126);
        setTimeout(function(){
            invalid_action.remove();
        },252);
    };
    
    var lost_actions = [];
    var execute_lost_actions = function(){
        if(!page_transition_active && lost_actions.length > 0)
            lost_actions.pop()();
    };
    setInterval(execute_lost_actions,50)
    
    var current_right_key_handler;
    var current_left_key_handler;
    var attach_key_handlers = function(){
        $(document).observe('keydown',function(event){
            if(event.keyCode == Event.KEY_RIGHT){
                right_key_handler();
            }else if(event.keyCode == Event.KEY_LEFT){
                left_key_handler();
            }else if(event.keyCode == Event.KEY_UP){
                up_key_handler();
            }else if(event.keyCode == Event.KEY_DOWN){
                down_key_handler();
            }
        });
    };
    var detatch_key_handlers = function(){
        $(document).stopObserving('keydown');
    };
    var left_key_handler = function(){
        var previous = get_previous_link();
        if(previous){
            if(!page_transition_active){
                go_to_previous_page();
            }else if(page_transition_active && lost_actions.length < 2){
                lost_actions.push(left_key_handler);
            }
        }else{
            display_invalid_action('left');
        }
    };
    var right_key_handler = function(){
        var next = get_next_link();
        if(next){
            if(!page_transition_active){
                go_to_next_page();
            }else if(page_transition_active && lost_actions.length < 2){
                lost_actions.push(right_key_handler);
            }
        }else{
            display_invalid_action('right');
        }
    };
    var up_key_handler = function(){
        var previous_collection = get_previous_collection();
        if(previous_collection){
            if(!page_transition_active){
                activate_collection(previous_collection,function(){
                    display_collection_title(previous_collection.down('a').innerHTML);
                });
            }else if(page_transition_active && lost_actions.length < 2){
                lost_actions.push(up_key_handler);
            }
        }else{
            display_invalid_action('up');
        }
    };
    var down_key_handler = function(){
        var next_collection = get_next_collection();
        if(next_collection){
            if(!page_transition_active){
                activate_collection(next_collection,function(){
                    display_collection_title(next_collection.down('a').innerHTML);
                });
            }else if(page_transition_active && lost_actions.length < 2){
                lost_actions.push(down_key_handler);
            }
        }else{
            display_invalid_action('down');
        }
    };
    
    attach_key_handlers();
        
    //navigation
    var navigation_visible = false;
    var navigation = $('navigation');
    var navigation_inner_container = $('navigation_inner_container');
    var navigation_fader = new Fx.Opacity(navigation_inner_container,{
      duration: 250
    });
    var navigation_fade_timeout = null;
    var navigation_appear = function(){
        if(!navigation_visible){
            navigation_fader.custom(0,1);
            navigation_visible = true;
        }
    };
    var navigation_fade = function(){
        if(collections_visible || is_front_page())
            return;
        navigation_fader.custom(1,0);
        navigation_visible = false;
    };
    if(!is_front_page())
        navigation_fader.hide();
    else
        navigation_visible = true;
    navigation.observe('mouseenter',function(){
        clearTimeout(navigation_fade_timeout);
        navigation_appear();
    });
    navigation.observe('mouseleave',function(event){
        if(event.relatedTarget && $(event.relatedTarget).hasClassName('previous_collection'))
            return;
        navigation_fade();
    });
    
    var attach_home_link_behaviors = function(){
        [
            $(document.body).down('#navigation_inner_container ul li a'),
            $(document.body).down('#navigation_inner_container a')
        ].invoke('observe','click',function(event){
            event.stop();
            if(is_front_page())
                return;
            go_to_page(this.href,null,function(){
                var home_fader = new Fx.Opacity($('home'),{
                    duration: 450
                });
                home_fader.hide();
                home_fader.custom(0,1);
                attach_latest_collection_behaviors();
                collections.select('.active').each(function(collection){
                    collection.removeClassName('active');
                    collection.addClassName('inactive');
                });
            });
        });
    };
    attach_home_link_behaviors();
    
    //collections menu
    var collections_visible = false;
    var collections_link = $('collections_link');
    var collections = $('collections');
    var collections_fader = new Fx.Opacity(collections,{
        duration: 250
    });
    var collections_appear = function(){
        collections_fader.custom(0,1);
        collections_visible = true;
        collections.observe('mouseleave',collections_fade);
    };
    var collections_fade = function(){
        collections_fader.custom(1,0);
        collections_visible = false;
        navigation_fade_timeout = setTimeout(navigation_fade,1);
        collections.stopObserving('mouseleave',collections_fade);
    };
    collections_fader.hide();
    collections_link.observe('mouseenter',collections_appear);
    
    //collections navigation
    var display_collection_title = function(text){
        if(navigation_visible || collections_visible || $(document.body).down('.collection_title'))
            return;
        var collection_title = new Element('p',{
            className: 'collection_title'
        });
        collection_title.update(text);
        var collection_title_fader = new Fx.Opacity(collection_title,{
            duration: 500
        });
        $('main').insert(collection_title);
        collection_title_fader.hide();
        collection_title_fader.toggle();
        setTimeout(function(){
            collection_title_fader.toggle();
        },2501);
        setTimeout(function(){
            collection_title.remove();
        },3002);
    };
    
    var activate_collection = function(collection,proceed){
        var parent_collection = collection.up('li');
        if(parent_collection && !parent_collection.hasClassName('active')){
            var parent_collection_siblings = parent_collection.siblings();
            parent_collection_siblings.invoke('removeClassName','active');
            parent_collection_siblings.invoke('addClassName','inactive');
            parent_collection.removeClassName('inactive');
            parent_collection.addClassName('active');
        }
        var siblings = collection.siblings();
        siblings.invoke('removeClassName','active');
        siblings.invoke('addClassName','inactive');
        collection.addClassName('active');
        collection.removeClassName('inactive');
        var child_list_items = collection.select('li');
        child_list_items.invoke('removeClassName','active');
        child_list_items.invoke('addClassName','inactive');
        collections.select('.inactive .active').each(function(collection){
            collection.removeClassName('active');
            collection.addClassName('inactive');
        });
        if(child_list_items.length == 0){
            if(collections_visible)
                collections_fade();
            show_indicator();
            go_to_page(collection.down('a').href,function(){
                if(proceed)
                    proceed();
                hide_indicator();
            });
        }
    }
    
    var get_current_collection = function(){
        return collections.select('.active').find(function(collection){
            return !collection.down('.active');
        });
    };
    
    var get_next_collection = function(){
        var current = get_current_collection();
        if(!current)
            return false;
        var next_collection = current.nextSiblings('li').first();
        if(next_collection && next_collection.select('li').length > 0){
            next_collection = next_collection.select('li').first();
        }else if(!next_collection && current.up('li')){
            next_collection = current.up('li').nextSiblings('li').first();
        }
        return next_collection;
    };
    
    var get_previous_collection = function(){
        var current = get_current_collection();
        if(!current)
            return false;
        var previous_collection = current.previousSiblings('li').first();
        if(previous_collection && previous_collection.select('li').length > 0){
            previous_collection = previous_collection.select('li').last();
        }else if(!previous_collection && current.up('li')){
            previous_collection = current.up('li').previousSiblings('li').first();
        }
        return previous_collection;
    };
    
    var collections_list_items = collections.select('li');
    collections_list_items.each(function(collection){
        collection.observe('click',function(event){
            activate_collection(collection);
            event.stop(); 
        });
    });
    
    //tutorial
    var show_tutorial = function(){
        var tutorial_fader = new Fx.Opacity($('tutorial'),{
            duration: 500
        });
        
        navigation_fader.hide();
        navigation_visible = false;
        
        var navigation_label_fader = new Fx.Opacity($('navigation_label'),{
            duration: 500
        });
        navigation_label_fader.hide();
        
        var next_photo_fader = new Fx.Opacity($('tutorial_next_photo_container'),{
            duration: 500
        });
        var previous_photo_fader = new Fx.Opacity($('tutorial_previous_photo_container'),{
            duration: 500
        });
        var next_collection_fader = new Fx.Opacity($('tutorial_next_collection_container'),{
            duration: 500
        });
        var previous_collection_fader = new Fx.Opacity($('tutorial_previous_collection_container'),{
            duration: 500
        });
        next_photo_fader.hide();
        previous_photo_fader.hide();
        next_collection_fader.hide();
        previous_collection_fader.hide();
        
        //keys
        var keys_label_fader = new Fx.Opacity($('keys_label'),{
            duration: 500
        });
        var up_key_fader = new Fx.Opacity($('up_key'),{
            duration: 250
        });
        var down_key_fader = new Fx.Opacity($('down_key'),{
            duration: 250
        });
        var left_key_fader = new Fx.Opacity($('left_key'),{
            duration: 250
        });
        var right_key_fader = new Fx.Opacity($('right_key'),{
            duration: 250
        });
        keys_label_fader.hide();
        up_key_fader.hide();
        down_key_fader.hide();
        left_key_fader.hide();
        right_key_fader.hide();
        
        setTimeout(function(){
            next_photo_fader.toggle();
            setTimeout(function(){next_collection_fader.toggle();},250);
            setTimeout(function(){previous_photo_fader.toggle();},500);
            setTimeout(function(){previous_collection_fader.toggle();},750);
            
            //keys
            setTimeout(function(){keys_label_fader.toggle();},1000);
            setTimeout(function(){right_key_fader.toggle();},1125);
            setTimeout(function(){down_key_fader.toggle();},1250);
            setTimeout(function(){left_key_fader.toggle();},1375);
            setTimeout(function(){up_key_fader.toggle();},1500);
            
            //navigation info
            setTimeout(function(){navigation_label_fader.toggle();},3000);
            setTimeout(function(){navigation_appear();},3500);
            
            setTimeout(function(){tutorial_fader.custom(1,0);},7000);
            setTimeout(function(){navigation_fade();},7500);
            setTimeout(function(){$('tutorial').remove();},8001);
        },3751);
    };
});