
function start_backtesting(){
    $("#backtesting_progress_bar").show();
    lock_interface();
    const request = get_selected_files();
    const update_url = $("#startBacktesting").attr("start-url");
    send_and_interpret_bot_update(request, update_url, null, start_success_callback, start_error_callback)
}

function start_success_callback(updated_data, update_url, dom_root_element, msg, status){
    $("#progess_bar_anim").css('width', 0+'%').attr("aria-valuenow", 0);
    create_alert("success", msg, "");
}

function start_error_callback(updated_data, update_url, dom_root_element, result, status, error){
    create_alert("error", result.responseText, "");
    $("#backtesting_progress_bar").hide();
    lock_interface(false);
}

function get_selected_files(){
    let selected_modules = [];
    dataFilesTable.rows(
        function ( idx, data, node ) {
            return $(node).find("input[type='checkbox']:checked").length > 0;
        }
    ).eq(0).each(function( index ) {
        selected_modules.push(dataFilesTable.row( index ).data()[1]);
    });
    return selected_modules;
}

function lock_interface(lock=true){
    let should_lock = lock;
    if(!should_lock){
        should_lock = get_selected_files() <= 0;
    }
    $('#startBacktesting').prop('disabled', should_lock);
}

function handle_backtesting_buttons(){
    $("#startBacktesting").click(function(){
        start_backtesting();
    });
}

function load_report(should_alert=False){
    const url = $("#backtestingReport").attr(update_url_attr);
    $.get(url,function(data){
        let profitability = data["bot_report"]["profitability"];
        if ("error" in data) {
            let error_message = "Warning: error during backtesting (" + data["error"] + "), more details in logs.";
            profitability = profitability + " " + error_message;
            if (should_alert) {
                create_alert("error", error_message, "");
            }
        }

        let symbol_reports = [];
        $.each( data["symbol_report"], function( index, value ) {
            $.each( value, function( symbol, profitability ) {
                symbol_reports.push(symbol+": "+profitability);
            });
        });
        let all_profitability = symbol_reports.join(", ");
        $("#bProf").html(profitability);
        $("#maProf").html(data["bot_report"]["market_average_profitability"]);
        $("#refM").html(data["bot_report"]["reference_market"]);
        $("#sProf").html(all_profitability);
        let portfolio_reports = [];
            $.each( data["bot_report"]["end_portfolio"], function( symbol, holdings ) {
                portfolio_reports.push(symbol+": "+holdings["total"]);
            });
        $("#ePort").html(portfolio_reports.join(", "));

        add_graphs(data["symbols_with_time_frames_frames"]);
    });
}

function add_graphs(symbols_with_time_frames){
    const result_graph_id = "result-graph-";
    const graph_symbol_price_id = "graph-symbol-price-";
    let result_graphs = $("#result-graphs");
    result_graphs.empty();
    $.each(symbols_with_time_frames, function (symbol, time_frame) {
        const target_template = $("#"+result_graph_id+config_default_value);
        const graph_card = target_template.html().replace(new RegExp(config_default_value,"g"), symbol);
        result_graphs.append(graph_card);
        const formated_symbol = symbol.replace(new RegExp("/","g"), "|");
        get_symbol_price_graph(graph_symbol_price_id+symbol, "ExchangeSimulator", formated_symbol, time_frame, true);
    })
}

function update_progress(progress){
    $("#progess_bar_anim").css('width', progress+'%').attr("aria-valuenow", progress)
}

function check_backtesting_state(){
    const url = $("#backtestingPage").attr(update_url_attr);
    $.get(url,function(data, status){
        let backtesting_status = data["status"];
        let progress = data["progress"];

        const report = $("#backtestingReport");
        const progress_bar = $("#backtesting_progress_bar");

        if(backtesting_status === "computing"){
            lock_interface(true);
            progress_bar.show();
            update_progress(progress);
            first_refresh_state = backtesting_status;
            if(report.is(":visible")){
                report.hide();
            }
        }
        else{
            lock_interface(false);
            progress_bar.hide();
            if(backtesting_status === "finished"){
                let should_alert = first_refresh_state !== "" && first_refresh_state !== "finished";
                if(should_alert){
                    create_alert("success", "Backtesting finished.", "");
                    first_refresh_state="finished";
                }
                if(!report.is(":visible")){
                    report.show();
                    load_report(should_alert);
                }
            }
        }
        if(first_refresh_state === ""){
            first_refresh_state = backtesting_status;
        }
    });
}

function handle_file_selection(){
    const selectable_datafile = $(".selectable_datafile");
    selectable_datafile.unbind('click');
    selectable_datafile.click(function () {
        const row_element = $(this);
        if (row_element.hasClass(selected_item_class)){
            row_element.removeClass(selected_item_class);
            row_element.find(".dataFileCheckbox").prop('checked', false);
        }else{
            row_element.toggleClass(selected_item_class);
            const checkbox = row_element.find(".dataFileCheckbox");
            const symbol = checkbox.attr("symbol");
            const data_file = checkbox.attr("data-file");
            checkbox.prop('checked', true);
            // uncheck same symbols from other rows if any
            $("#dataFilesTable").find("input[type='checkbox']:checked").each(function(){
                if($(this).attr("symbol") === symbol && !($(this).attr("data-file") === data_file)){
                    $(this).parent().parent().removeClass(selected_item_class);
                    $(this).prop('checked', false);
                }
            });
        }
        lock_interface(false);
    });
}

let first_refresh_state = "";

const dataFilesTable = $('#dataFilesTable').DataTable();

$(document).ready(function() {
    handle_backtesting_buttons();
    handle_file_selection();
    $('#dataFilesTable').on("draw.dt", function(){
        handle_file_selection();
    });
    lock_interface();

    setInterval(function(){refresh_status();}, 1000);
    function refresh_status(){
        check_backtesting_state();
    }
});
