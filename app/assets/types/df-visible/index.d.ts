// Type definitions for jquery-visible
// Project: https://github.com/customd/jquery-visible
// Definitions by: Andrey Lipatkin <https://github.com/Litee>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="jquery" />

type Direction = "horizontal" | "vertical" | "both";

interface JQuery {
    /**
     * Gets the value of a setting.
     * @param details Which setting to consider.
     * @param callback The callback parameter should be a function that looks like this:
     * function(object details) {...};
     */
    visible(partial?: boolean, hidden?: boolean, direction?: Direction): boolean;

    floatingScroll(arg : string) : any;
}