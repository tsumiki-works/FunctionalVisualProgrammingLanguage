import { Environment } from "../evaluation/environment.js";
import { BlockConst } from "./block_const.js";
import { Inference } from "./inference/inference.js";
import { Roots } from "./roots.js";

/* ================================================================================================================= */
/*     Block                                                                                                         */
/*         is a kind of HTMLElement                                                                                  */
/*         has parent                                                                                                */
/*         has "pyramid-block" class                                                                                 */
/*         can connect a block by replacing its empty block block                                                    */
/* ================================================================================================================= */

export abstract class Block extends HTMLElement {

    private parent: Block | null;
    protected readonly playground: HTMLDivElement = document.getElementById("playground") as HTMLDivElement;

    constructor(lr: Vec2) {
        super();
        this.parent = null;
        this.classList.add("pyramid-block");
        this.style.left = lr[0] + "px";
        this.style.top = lr[1] + "px";
        this.style.minWidth = BlockConst.UNIT_WIDTH + "px";
        this.style.minHeight = BlockConst.UNIT_HEIGHT + "px";
        Roots.append(this);
    }

    set_left(x: number): void {
        const left = x - this.get_width() * 0.5;
        let parent: HTMLElement = null;
        if (this.parent === null) {
            parent = document.getElementById("workspace");
        } else {
            parent = this.parent;
        }
        this.style.left = -(parent.getBoundingClientRect().left - left) + "px";
    }
    set_top(y: number): void {
        const top = y - this.get_height() * 0.5;
        let parent: HTMLElement = null;
        if (this.parent === null) {
            parent = document.getElementById("workspace");
        } else {
            parent = this.parent;
        }
        this.style.top = -(parent.getBoundingClientRect().top - top) + "px";
    }
    set_parent(parent: Block): void {
        this.parent = parent;
    }

    get_x(): number {
        return this.getBoundingClientRect().left + this.get_width() * 0.5;
    }
    get_y(): number {
        return this.getBoundingClientRect().top + this.get_height() * 0.5;
    }
    get_width(): number {
        return this.offsetWidth;
    }
    get_height(): number {
        return this.offsetHeight;
    }
    get_root(): Block {
        if (this.parent === null) {
            return this;
        } else {
            return this.parent.get_root();
        }
    }
    get_parent(): Block {
        return this.parent;
    }
    get_children(): Array<Block> {
        let res = new Array();
        for (const child of Array.from(this.children)) {
            if (child.classList.contains("pyramid-block")) {
                res.push(child);
            }
        }
        return res;
    }

    connect_with(target: Block): boolean {
        if (this === target) {
            return false;
        }
        for (const child of this.get_children()) {
            if (child.is_empty()
                && Math.abs(child.get_x() - target.get_x()) < child.get_width() * 0.5
                && Math.abs(child.get_y() - target.get_y()) < child.get_height() * 0.5
            ) {
                this.replaceChild(target, child);
                target.parent = this;
                child.parent = null;
                child.kill();
                this.get_root().format();
                return true;
            }
            if (child.connect_with(target)) {
                return true;
            }
        }
        return false;
    }

    format() {
        Inference.infer(this);
        Roots.determine_pos(this.get_x(), this.get_y(), this, Roots.determine_width(this));
    }

    abstract is_empty(): boolean;
    abstract kill(): void;
    abstract eval(env: Environment): PyramidObject;
}