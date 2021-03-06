function update_badge(badge, new_text, new_class){
    badge.removeClass(secondary_badge);
    badge.removeClass(warning_badge);
    badge.removeClass(success_badge);
    badge.removeClass(primary_badge);
    badge.addClass(new_class);
    badge.html(new_text);
}

function update_list_item(list_item, new_class){
    list_item.removeClass(light_list_item);
    list_item.removeClass(success_list_item);
    list_item.addClass(new_class);
}

function update_element_temporary_look(element){
    var set_to_activated = element.attr(current_value_attr).toLowerCase() === "true";
    var set_to_temporary = element.attr(current_value_attr).toLowerCase() !== element.attr(config_value_attr).toLowerCase();
    var is_back_to_startup_value = element.attr(startup_value_attr).toLowerCase() === element.attr(config_value_attr).toLowerCase();
    if(element.hasClass("list-group-item")){
        // list item
        var list_class = (set_to_activated ? success_list_item : light_list_item);
        update_list_item(element, list_class);
    }
    var badge = element.find(".badge");
    if(typeof badge !== "undefined") {
        if(set_to_temporary){
            update_badge(badge, unsaved_setting, primary_badge);
        }else{
            if(set_to_activated){
                if (!is_back_to_startup_value){
                    update_badge(badge, activation_pending, warning_badge);
                }else{
                    update_badge(badge, activated, success_badge);
                }
            }else{
                if (!is_back_to_startup_value){
                    update_badge(badge, deactivation_pending, warning_badge);
                }else{
                    update_badge(badge, deactivated, secondary_badge);
                }
            }
        }
    }
}

function change_boolean(to_update_element, new_value, new_value_string){
    var badge = to_update_element.find(".badge");
    var startup_value = to_update_element.attr(startup_value_attr).toLowerCase();
    var is_back_to_startup_value = startup_value === new_value_string;
    if(new_value){
        update_list_item(to_update_element, success_list_item);
        if (!is_back_to_startup_value){
            update_badge(badge, activation_pending, warning_badge);
        }else{
            update_badge(badge, activated, success_badge);
        }
    }else{
        update_list_item(to_update_element, light_list_item);
        if (!is_back_to_startup_value){
            update_badge(badge, deactivation_pending, warning_badge);
        }else{
            update_badge(badge, deactivated, secondary_badge);
        }
    }
}

function update_dom(root_element, message){
    var config_value_attr = "config-value";

    // update global configuration
    var super_container = $("#super-container");
    confirm_all_modified_classes(super_container);

    // update evaluators
    for (var conf_key in message["evaluator_updated_config"]) {
        var new_value = message["evaluator_updated_config"][conf_key];
        var new_value_type = "boolean";
        var new_value_string = new_value.toString();
        var to_update_element = root_element.find("#"+conf_key);

        var attr = to_update_element.attr(config_value_attr);

        if (isDefined(attr)) {
            if (attr.toLowerCase() !== new_value_string){
                to_update_element.attr(config_value_attr, new_value_string);
                if(new_value_type === "boolean"){
                    var bool_val = new_value.toLowerCase() === "true";
                    change_boolean(to_update_element, bool_val, new_value_string);
                }

            }
        }else{
            // todo find cards to update using returned data
            to_update_element.removeClass(modified_class)
        }

    }
}

function create_alert(a_level, a_title, a_msg, url="_blank"){
    toastr[a_level](a_msg, a_title);

    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": 300,
      "hideDuration": 1000,
      "timeOut": 5000,
      "extendedTimeOut": 1000,
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
}

function lock_ui(){
    $(".nav-link").addClass("disabled");
    update_status(false);
}

function unlock_ui(){
    $(".nav-link").removeClass("disabled");
    update_status(true);
}

function update_status(status){
    var icon_status = $("#navbar-bot-status");
    var icon_reboot = $("#navbar-bot-reboot");

    // if refreshed page
    if (icon_status.hasClass("fa-spinner")){
        icon_status.removeClass("fa-spinner fa-spin")
    }

    // create alert if required
    if (status && icon_status.hasClass("icon-red")){
        create_alert("success", "Connected with Octobot", "");
    }else if(!status && icon_status.hasClass("icon-green")){
        create_alert("error", "Connection lost with Octobot", "<br>Reconnecting...");
    }

    // update central status
    if (status){
        icon_status.removeClass("fa-times-circle icon-red");
        icon_status.addClass("fa-check-circle icon-green");
    }else{
        icon_status.removeClass("fa-check-circle icon-green");
        icon_status.addClass("fa-times-circle icon-red");
    }

    // update reboot status
    if (status){
        icon_reboot.removeClass("fa-spin");
    }else{
        icon_reboot.addClass("fa-spin");
    }
}

function register_exit_confirm_function(check_function) {
    var exit_event = 'beforeunload';
    $(window).bind(exit_event, function(){
      if(check_function()){
          return "Exit without saving ?";
      }
    });
}

function remove_exit_confirm_function(){
    var exit_event = 'beforeunload';
    $(window).off(exit_event);
}


function confirm_all_modified_classes(container){
    container.find("."+deck_container_modified_class).each(function () {
        toogle_class($(this), deck_container_modified_class, false);
    });
    container.find("."+card_class_modified).each(function () {
        toogle_class($(this), card_class_modified, false);
    });
    container.find("."+added_class).each(function () {
        toogle_class($(this), added_class, false);
    });
}

function toogle_class(elem, class_type, toogle=true){
    if(toogle && !elem.hasClass(class_type)){
        elem.addClass(class_type, 500);
    }else if(!toogle && elem.hasClass(class_type)){
        elem.removeClass(class_type);
    }
}

function toogle_deck_container_modified(container, modified=true) {
    toogle_class(container, deck_container_modified_class, modified);
}

function toogle_card_modified(card, modified=true) {
    toogle_class(card, card_class_modified, modified);
}
