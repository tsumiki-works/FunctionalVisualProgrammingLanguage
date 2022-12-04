import { Popup } from "../popup.js";
import { Block } from "./block.js";
import { EmptyBlock } from "./empty_block.js";

export class AtomBlock extends Block {
    constructor(left: number, top: number, content: string, type_id: PyramidTypeID) {
        switch (type_id) {
            case PyramidTypeID.I32:
            case PyramidTypeID.F32:
            case PyramidTypeID.Bool:
            case PyramidTypeID.String:
                break;
            default:
                throw new Error(type_id + " is not atom.");
        }
        super({ type_id: type_id, attribute: null });
        this.style.left = left + "px";
        this.style.top = top + "px";
        this.style.backgroundColor = "blue"; //! [TODO]
        this.span.innerText = content;
    }
    protected override build_popup_event(): [string, EventListener][] {
        return [
            ["編集", (e: MouseEvent) => this.popup_event_edit(e)],
            ["削除", _ => this.popup_event_kill()],
        ];
    }
    private popup_event_edit(e: MouseEvent) {
        Popup.remove_popup();
        const popup = document.createElement("div");
        popup.id = "popup-menu";
        popup.style.display = "block";
        popup.style.left = e.pageX + "px";
        popup.style.top = e.pageY + "px";
        document.body.appendChild(popup);
        const input = document.createElement("input");
        input.id = "popup-menu-edit";
        input.contentEditable = "true";
        input.addEventListener("keydown", (e => {
            if (e.key == "Enter") {
                if (!Number.isNaN(Number(input.value))) {
                    this.span.innerText = input.value;
                    this.get_root().format();
                }
                Popup.remove_popup();
            }
        }));
        popup.appendChild(input);
        input.focus();
    }

    replace_child(target: Block, after?: Block) {
        if (this === target) {
            throw new Error("Pyramid frontend error: tried to remove self.");
        }
        for (let i = 0; i < this.child_blocks.length; ++i) {
            if (this.child_blocks[i] === target) {
                if (typeof after === "undefined") {
                    this.child_blocks[i] = new EmptyBlock();
                } else {
                    this.child_blocks[i] = after;
                }
                this.child_blocks[i].parent = this;
                target.parent = null;
                this.get_root().format();
                return;
            }
        }
        throw new Error("Pyramid frontend error: tried to unexisting block.");
    }

    eval(env: Map<String, any>): PyramidObject{
        switch (this.pyramid_type.type_id) {
            case PyramidTypeID.Empty:
                throw new Error("evaluated Empty");
            case PyramidTypeID.I32:
                //! [TODO]
                return { pyramid_type: this.pyramid_type, value: this.get_content() };
            case PyramidTypeID.F32:
                //! [TODO]
                return { pyramid_type: this.pyramid_type, value: this.get_content() };
            case PyramidTypeID.Bool:
                //! [TODO]
                return { pyramid_type: this.pyramid_type, value: this.get_content() };
            case PyramidTypeID.String:
                //! [TODO]
                return { pyramid_type: this.pyramid_type, value: this.get_content() };
            case PyramidTypeID.List:
                //! [TODO]
                return { pyramid_type: this.pyramid_type, value: this.get_content() };
            default:
                throw new Error("pyramid backend error:" + this.get_content() + "is not atom object.");
        }
    }
}
customElements.define('pyramid-block-atom', AtomBlock);