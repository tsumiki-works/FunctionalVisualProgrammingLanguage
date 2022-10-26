let mouse_pos_before_drag_x = 0.0;
let mouse_pos_before_drag_y = 0.0; 
let camera_pos_before_drag_x = 0.0;
let camera_pos_before_drag_y = 0.0;

function get_world_pos(x, y) {
    let pos = convert_clipping_to_view(
        [get_workspace_x(x), get_workspace_y(y), camera[2], 1.0],
        canvas.width,
        canvas.height
    );
    pos[0] = pos[0] * camera[2] * -1.0 - camera[0];
    pos[1] = pos[1] * camera[2] * -1.0 - camera[1];
    pos[2] = pos[2] * camera[2] * -1.0 - camera[2];
    return pos;
}

function get_workspace_x(pageX) {
    const c = canvas.width * 0.5;
    return (pageX - c) / c;
}
function get_workspace_y(pageY) {
    const c = canvas.height * 0.5;
    return -1.0 * (pageY - c) / c;
}

function fun_mousedown(event) {
    // mouseleft down
    if (event.which == 1) {
        if (event.pageX < MENU_WIDTH) {
            alert("clicked menu");
        } else {
            const pos = get_world_pos(event.pageX, event.pageY);
            create_block(pos[0], pos[1], 0, "");
        }
    }
    // mouseright down : move around workspace
    else if (event.which == 3) {
        mouse_pos_before_drag_x = event.pageX;
        mouse_pos_before_drag_y = event.pageY;
        camera_pos_before_drag_x = camera[0];
        camera_pos_before_drag_y = camera[1];
        canvas.addEventListener("mousemove", fun_right_mousemove);
        canvas.addEventListener("mouseup", fun_right_mouseup);
        canvas.removeEventListener("mousedown", fun_mousedown);
    }
    render();
}

function fun_right_mouseup(_) {
    canvas.removeEventListener("mousemove", fun_right_mousemove);
    canvas.removeEventListener("mouseup", fun_right_mouseup);
    canvas.addEventListener("mousedown", fun_mousedown);
    render();
}

function fun_right_mousemove(event) {
    const c = 0.01;
    camera[0] = camera_pos_before_drag_x - (mouse_pos_before_drag_x - event.pageX) * c;
    camera[1] = camera_pos_before_drag_y + (mouse_pos_before_drag_y - event.pageY) * c;
    render();
}

function fun_wheel(event) {
    if (event.wheelDelta > 0) {
        camera[2] += 0.5;
    } else if (event.wheelDelta < 0) {
        camera[2] -= 0.5;
    }
    camera[2] = Math.max(Math.min(camera[2], -1.5), -10.0);
    event.preventDefault();
    render();
}

function fun_keydown(event) {
    if (event.key.length == 1 && event.key.charCodeAt(0) >= 32 && event.key.charCodeAt(0) <= 126) {
        event.preventDefault(); // disable browser shortcut
        input_char(event.key);
    } else if (event.key == "Backspace") {
        remove_char();
    } else if (event.key == "Enter") {
        enter();
    }
    render();
}