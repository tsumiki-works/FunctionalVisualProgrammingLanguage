type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

enum PyramidTypeID {
    Empty,
    String,
    I32,
    F32,
    Bool,
    Function,
    List,
}
type PyramidType = {
    type_id: PyramidTypeID;
    attribute: any,
};
type FunctionAttribute = {
    args_cnt: number;
    return_type: PyramidType;
};
type PyramidObject = {
    pyramid_type: PyramidType;
    value: any;
};
type PyramidMenuContent = {
    color: string;
    text: string;
    block_constructor: Function;
}

type Environment = Map<string, PyramidObject>;
type Keyword = [string, PyramidObject];

type PopupEvent = [string, EventListener];