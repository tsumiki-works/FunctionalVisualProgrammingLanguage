import { isConstructorDeclaration } from "typescript";
import { Popup } from "../popup.js";
import { BlockFormatter } from "./block_formatter.js";
import { EmptyBlock } from "./empty_block.js";

export abstract class Block extends HTMLElement {

    static readonly UNIT_WIDTH = 100.0;
    static readonly UNIT_HALF_WIDTH = 50.0;
    static readonly UNIT_HEIGHT = 50.0;
    static readonly UNIT_HALF_HEIGHT = 25.0;

    protected readonly pyramid_type: PyramidType;
    protected readonly child_blocks: Block[];
    protected readonly span: HTMLSpanElement;
    parent: Block | null;

    protected constructor(pyramid_type?: PyramidType) {
        super();
        // fields
        if (typeof pyramid_type === "undefined") {
            this.pyramid_type = { type_id: PyramidTypeID.Empty, attribute: null };
        } else {
            this.pyramid_type = pyramid_type;
        }
        this.child_blocks = [];
        this.span = document.createElement("span");
        this.appendChild(this.span);
        this.parent = null;
        // html div element
        this.classList.add("pyramid-block");
        this.style.left = "-10px";
        this.style.top = "-10px";
        this.style.backgroundColor = "rgb(0, 0, 0, 0.5)";
        this.style.minWidth = Block.UNIT_WIDTH + "px";
        this.style.minHeight = Block.UNIT_HEIGHT + "px";
        document.getElementById("blocks").appendChild(this);
        // event
        this.init_events();
    }
    kill(): void {
        for (const child of this.child_blocks) {
            child.parent = null;
            child.kill();
        }
        if (this.parent !== null) {
            this.parent.replace_child(this);
        }
        this.remove();
    }

    set_left(x: number): void {
        this.style.left = (x - this.get_width() * 0.5) + "px";
    }
    set_top(y: number): void {
        this.style.top = (y - this.get_height() * 0.5) + "px";
    }
    set_parent(parent: Block): void {
        this.parent = parent;
    }

    get_x(): number {
        return this.offsetLeft + this.get_width() * 0.5;
    }
    get_y(): number {
        return this.offsetTop + this.get_height() * 0.5;
    }
    get_width(): number {
        return this.offsetWidth;
    }
    get_height(): number {
        return this.offsetHeight;
    }
    get_child_blocks(): Block[] {
        return this.child_blocks;
    }
    get_type(): PyramidType {
        return this.pyramid_type;
    }
    get_content(): string {
        return this.span.innerText;
    }
    get_root(): Block {
        if (this.parent === null) {
            return this;
        } else {
            return this.parent.get_root();
        }
    }

    is_empty(): boolean {
        return this.pyramid_type.type_id === PyramidTypeID.Empty;
    }
    is_hit(target: Block): boolean {
        console.log(target.get_x());
        return Math.abs(this.get_x() - target.get_x()) < this.get_width() * 0.5
            && Math.abs(this.get_y() - target.get_y()) < Block.UNIT_HEIGHT * 0.5;
    }

    abstract replace_child(target: Block, after?: Block)

    format() {
        BlockFormatter.format(this);
    }
    
    abstract eval(env: Map<String, any>): PyramidObject

    /* ============================================================================================================= */
    /*     Events                                                                                                    */
    /* ============================================================================================================= */

    private mousedown_listener: EventListener;
    private mousemove_listener: EventListener;
    private mouseup_listener: EventListener;

    private init_events() {
        this.mousedown_listener = (e: MouseEvent) => this.event_mousedown(e);
        this.mousemove_listener = (e: MouseEvent) => this.event_mousemove(e);
        this.mouseup_listener = (e: MouseEvent) => this.event_mouseup(e);
        this.addEventListener("mousedown", this.mousedown_listener);
    }

    private event_mousedown(e: MouseEvent) {
        Popup.remove_popup();
        if (this.is_empty()) {
            return;
        }
        if (e.button === 0) {
            const parent = this.parent;
            if (parent !== null) {
                parent.replace_child(this);
            }
            this.parent = null;
            document.getElementById("blocks").removeChild(this);
            document.getElementById("blocks").appendChild(this);
            this.get_root().format();
            this.removeEventListener("mousedown", this.mousedown_listener);
            document.addEventListener("mousemove", this.mousemove_listener);
            document.addEventListener("mouseup", this.mouseup_listener);
            e.stopPropagation();
        } else if (e.button === 2) {
            if (this.is_empty()) {
                return;
            }
            new Popup(e.pageX, e.pageY, this.build_popup_event());
            this.get_root().format();
            e.stopPropagation();
        }
    }

    private event_mousemove(e: MouseEvent) {
        this.style.left = (e.pageX - this.get_width() * 0.5) + "px";
        this.style.top = (e.pageY - this.get_height() * 0.5) + "px";
        this.get_root().format();
    }

    private event_mouseup(_: MouseEvent) {
        //console.log(this.pyramid_type);
        const blocks = document.querySelectorAll('#blocks pyramid-block-empty');
        console.log(blocks.length);
        //console.log("aaa");
        for (let i = 0; i < blocks.length; ++i) {
            const block = blocks[i] as Block;
            //console.log(block);
            if (this.is_hit(block) && block.pyramid_type.type_id === PyramidTypeID.Empty) {
                console.log("hit");
                if (block.parent === null) {
                    throw new Error("empty block cannot be at the top level but found.");
                }
                block.parent.replace_child(block, this);
                block.kill();
                break;
            }
        }
        //console.log("ccc");
        document.removeEventListener("mousemove", this.mousemove_listener);
        document.removeEventListener("mouseup", this.mouseup_listener);
        this.addEventListener("mousedown", this.mousedown_listener);
    }

    protected build_popup_event(): [string, EventListener][] {
        return [
            ["削除", _ => this.popup_event_kill()],
        ];
    }

    protected popup_event_kill() {
        this.kill();
        Popup.remove_popup();
    }
}