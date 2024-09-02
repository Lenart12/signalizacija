<script lang="ts">
	import { onMount } from "svelte";
    import { type MorseKey, read_morse_keyboard, read_morse_button, type OnMorseKeyCb, morse_decode, morse_encode } from "$lib/morse";

    let dash_threshold = 300;
    let letter_break_threshold = 1000;
    let letter_count = 25;
   
    let morse_button_tryitout: HTMLButtonElement;
    let morse_button_tx: HTMLButtonElement;

    const set_morse_key_cb = (dash_threshold: number, letter_break_threshold: number, cb: OnMorseKeyCb) => {
        Object.assign(document, read_morse_keyboard(dash_threshold, letter_break_threshold, cb));
        const morse_key_btn = read_morse_button(dash_threshold, letter_break_threshold, cb);
        Object.assign(morse_button_tryitout, morse_key_btn);
        Object.assign(morse_button_tx, morse_key_btn);
    };

    let try_it_out: string = '';
    const on_morse_key_tryitout = (m: MorseKey) => {
        if (m === ' ') try_it_out = '';
        else try_it_out += m;
    };

    let tx_target: string = '';
    let tx_actual: string[] = [];
    let tx_actual_decoded: string = '';
    let tx_current: string = '';
    let tx_cols: number = 0;
    let tx_rows: number = 0;
    let tx_correct: number = 0;
    let tx_start: number = 0;
    let tx_time: string = '';

    const on_morse_key_tx = (m: MorseKey) => {
        console.log('tx', m);
        if (m !== ' ') {
            tx_current += m;
            return;
        }

        if (morse_decode(tx_current) === tx_target[tx_actual.length]) {
            tx_correct++;
        }

        tx_actual = [...tx_actual, tx_current];
        tx_actual_decoded += morse_decode(tx_current);
        tx_current = '';

        if (tx_actual.length === tx_target.length) {
            set_morse_key_cb(dash_threshold, letter_break_threshold, () => {});
            const tx_dur = (Date.now() - tx_start) / 1000;
            tx_time = `${Math.floor(tx_dur / 60)}m ${Math.floor(tx_dur % 60).toString().padStart(2, '0')}s`;
        }
    };

    const start_tx = () => {
        tx_target = Array.from({length: letter_count}, () => {
            const c = Math.floor(Math.random() * 36);
            return c < 26 ? String.fromCharCode(65 + c) : String.fromCharCode(22 + c);
        }).join('');
        tx_cols = Math.min(10, Math.ceil(Math.sqrt(letter_count)));
        tx_rows = Math.ceil(letter_count / tx_cols);
        tx_actual = [];
        tx_actual_decoded = '';
        tx_current = '';
        tx_correct = 0;
        tx_start = Date.now();

        set_morse_key_cb(dash_threshold, letter_break_threshold, on_morse_key_tx);
    };

    const stop_tx = () => {
        set_morse_key_cb(dash_threshold, letter_break_threshold, on_morse_key_tryitout);
        tx_target = '';
    };


    
    onMount(() => {
        set_morse_key_cb(dash_threshold, letter_break_threshold, on_morse_key_tryitout);

        return () => {
            document.onkeydown = null;
            document.onkeyup = null;
            document.onpointerdown = null;
            document.onpointerup = null;
        };
    });
</script>

<div class="container h-full mx-auto flex justify-center items-center">
    <div class="card p-4 w-full">
		<header class="card-header">
			<h3 class="h3">Morse oddaja</h3>
		</header>
        <section class="p-4 space-y-2" hidden={tx_target !== ''}>
            <label for="dash_threshold" class="label">
                <span>Pika/Črta čas (ms)</span>
                <input class="input" title="Input (number)" type="number" id="dash_threshold" bind:value={dash_threshold} />
            </label>
            <label for="letter_break_threshold" class="label">
                <span>Pavza med znaki (ms)</span>
                <input class="input" title="Input (number)" type="number" id="letter_break_threshold" bind:value={letter_break_threshold} />
            </label>
            <label for="letter_count" class="label">
                <span>Število znakov</span>
                <input class="input" title="Input (number)" type="number" id="letter_count" bind:value={letter_count} />
            </label>

            <div class="card bg-primary-500 text-white p-4 rounded-lg flex justify-begin items-center flex-col">
                <h3 class="h3">Poizkusi oddajo</h3>
                <p class="lead">Pritisni na gumb ali preslednico.</p>
                <h5 class="h5">Trenutna oddaja: {try_it_out}</h5>
                <button class="btn variant-filled-secondary" bind:this={morse_button_tryitout}>Morse</button>
            </div>

            <div class="flex justify-center gap-2">
                <button class="btn variant-filled-primary" on:click={start_tx}>Začni</button>
                <a class="btn variant-filled-secondary" href="/">Nazaj</a>
            </div>
        </section>
        <section class="p-4 space-y-2" hidden={tx_target === ''} >
            <!-- Create table of tx_target -->
            <div class="card bg-primary-500 text-white p-4 rounded-lg flex justify-begin items-center flex-col gap-2">
                <table class="table-auto text-center">
                    {#each Array(tx_rows) as _, row}
                        <tr>
                            {#each Array(tx_cols) as _, col}
                                {@const i = row * tx_cols + col}
                                <td class="p-2 border border-gray-300" class:variant-filled-secondary={i === tx_actual.length && tx_actual.length < tx_target.length}>
                                    {#if i < tx_target.length}
                                        {#if tx_actual.length !== tx_target.length}
                                            {tx_target[i]}
                                        {:else}
                                            {#if tx_actual_decoded[i] !== tx_target[i]}
                                                <span class="variant-filled-error">{tx_actual_decoded[i]}</span>/{tx_target[i]}
                                                <br>
                                                <span class="variant-filled-error">{tx_actual[i]}</span>/
                                            {:else}
                                                {tx_actual_decoded[i]}
                                            {/if}
                                            <br>
                                            {morse_encode(tx_target[i])}
                                        {/if}
                                    {/if}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </table>
                <div hidden={tx_actual.length !== tx_target.length}>
                    <h5 class="h5">Oddaja končana</h5>
                    <p>Pravilno: {tx_correct}/{tx_target.length} ({Math.round(100 * tx_correct / tx_target.length)}%)</p>
                    <p>Čas: {tx_time}</p>
                </div>
                <div hidden={tx_actual.length === tx_target.length} class="flex flex-col items-center">
                    <h5 class="h5">Trenutna oddaja: {tx_current}</h5>
                    <button class="btn variant-filled-secondary" bind:this={morse_button_tx}>Morse</button>
                </div>
            </div>
            <div class="flex justify-center gap-2">
                <button class="btn variant-filled-error" on:click={stop_tx}>Končaj</button>
                <button class="btn variant-filled-primary" on:click={start_tx} on:mousedown|preventDefault={()=>{}}>Ponovi</button>
            </div>
        </section>
	</div>
</div>