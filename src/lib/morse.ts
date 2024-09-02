
export type MorseKey = '.' | '-' | ' ';
export type OnMorseKeyCb = (m: MorseKey) => void;

export const read_morse_keyboard = (dash_threshold: number, letter_break_threshold: number, on_pressed_cb: OnMorseKeyCb ) => {
    if (on_pressed_cb === null) {
        return {onkeydown: null, onkeyup: null};
    }

    let key_pressed_time = 0;
    let letter_break_timeout: NodeJS.Timeout | null = null;
    const start_time = (e: KeyboardEvent) => {
        if (e.key !== " " || e.repeat) {
            return;
        }
        if (letter_break_timeout !== null) {
            clearTimeout(letter_break_timeout);
        }
        key_pressed_time = Date.now();
    };
    const end_time = (e: KeyboardEvent) => {
        if (e.key !== " ") {
            return;
        }
        const key_released_time = Date.now();
        const key_duration = key_released_time - key_pressed_time;
        on_pressed_cb(key_duration > dash_threshold ? '-' : '.');
        letter_break_timeout = setTimeout(() => {
            on_pressed_cb(' ');
        }, letter_break_threshold);
    };
    return {
        onkeydown: start_time,
        onkeyup: end_time
    };
}

export const read_morse_button = (dash_threshold: number, letter_break_threshold: number, on_pressed_cb: (m: MorseKey) => void) => {
    if (on_pressed_cb === null) {
        return {onpointerdown: null, onpointerup: null};
    }
    
    let key_pressed_time = 0;
    let letter_break_timeout: NodeJS.Timeout | null = null;
    const start_time = (e: PointerEvent) => {
        if (letter_break_timeout !== null) {
            clearTimeout(letter_break_timeout);
        }
        key_pressed_time = Date.now();
    };
    const end_time = (e: PointerEvent) => {
        const key_released_time = Date.now();
        const key_duration = key_released_time - key_pressed_time;
        on_pressed_cb(key_duration > dash_threshold ? '-' : '.');
        letter_break_timeout = setTimeout(() => {
            on_pressed_cb(' ');
        }, letter_break_threshold);
    };
    return {
        onpointerdown: start_time,
        onpointerup: end_time
    };
};

const morse_table: any = {
    '.-': 'A',
    '-...': 'B',
    '-.-.': 'C',
    '-..': 'D',
    '.': 'E',
    '..-.': 'F',
    '--.': 'G',
    '....': 'H',
    '..': 'I',
    '.---': 'J',
    '-.-': 'K',
    '.-..': 'L',
    '--': 'M',
    '-.': 'N',
    '---': 'O',
    '.--.': 'P',
    '--.-': 'Q',
    '.-.': 'R',
    '...': 'S',
    '-': 'T',
    '..-': 'U',
    '...-': 'V',
    '.--': 'W',
    '-..-': 'X',
    '-.--': 'Y',
    '--..': 'Z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0',
}
const morse_table_i = Object.fromEntries(Object.entries(morse_table).map(([k, v]) => [v, k]));

export const morse_decode = (morse: string) => {
    const c = morse_table[morse];
    return c ? c : '?';
}
export const morse_encode = (c: string): string => {
    const morse = morse_table_i[c];
    return morse ? morse : '?';
}

function addBetweenElements(arr: any[], element: any) {
    return arr.reduce((acc, current, index) => {
        if (index < arr.length - 1) {
            return acc.concat(current, element);
        }
        return acc.concat(current);
    }, []);
}

export const generate_morse_sequence = (text: string, dot_time: number, dash_time: number, signal_break_time: number, letter_break_time: number) => {
    const morse_text = text.toUpperCase().split('').map((c: string) => morse_encode(c));
    const morse_sequence = addBetweenElements(morse_text.map((morse: string) => {
        console.log(morse);
        return addBetweenElements(Array.from(morse).map((m: string) => {
            return m === '.' ? dot_time : dash_time;
        }), signal_break_time);
    }), letter_break_time);
    if (morse_sequence.length % 2 !== 0) morse_sequence.push(0);
    return morse_sequence as number[];
}