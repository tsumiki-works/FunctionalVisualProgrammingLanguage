let log = "# ";
let cur = "";

// A funciton to add input charactor to the tail of current command line
function input_char(char) {
    cur += char;
}
// A function to remove 1 charactor from the tail of current command line
function remove_char() {
    cur = cur.slice(0, -1);
}
// A function to send current command with enter
function enter() {
    if (cur.length > 0) {
    }
    log += cur;
    log += "\n# ";
    cur = "";
}

// A function push requests for drawing console
function push_requests_console(requests) {
    requests.push(entity_console());
    const text = log + cur;
    if (text.length == 0)
        return;
    const lines = text.split("\n");
    let cnt = 0;
    for (let i = Math.max(lines.length - 9, 0); i < lines.length; ++i) {
        if (cnt > 9)
            break;
        push_requests_text(
            lines[i],
            get_centered_screen_x(MENU_WIDTH) + 20.0,
            -get_centered_screen_y(CONSOLE_HEIGHT) - 20.0 - cnt * 20.0,
            10.0,
            20.0,
            [1.0, 1.0, 1.0, 1.0],
            true,
            requests
        );
        cnt += 1;
    }
}