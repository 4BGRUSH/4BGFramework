export function* range(start: number, stop?: number, step = 1) {
    if (typeof stop === 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        yield i;
    }
}
