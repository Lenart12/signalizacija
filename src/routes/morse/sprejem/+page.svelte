<script lang="ts">
	import { generate_morse_sequence, morse_encode } from "$lib/morse";
    import { onMount } from "svelte";

    let dot_time = 100;
    let dash_time = 500;
    let signal_break_time = 300;
    let letter_break_time = 2500;
    let letter_count = 25;
   
    let rx_flashing_light: HTMLDivElement;
    let rx_target: string = '';
    let rx_actual: string = '';
    let rx_start: number = 0;
    let rx_rows: number = 0;
    let rx_cols: number = 0;
    let rx_correct: number = 0;
    let rx_time: string = '';
    
    let flash_timeout: NodeJS.Timeout | null = null;
    
    let rx_target_tryitout: string = '';
    let flashing_light_tryitout: HTMLDivElement;
    
    const start_lights_tx = (txt: string, light: HTMLDivElement) => {
        if (flash_timeout) clearTimeout(flash_timeout);

        const morse_tx_sequence = generate_morse_sequence(txt, dot_time, dash_time, signal_break_time, letter_break_time);

        const flash_color = (color: string, after_cb?: () => void) => {
            light.style.backgroundColor = `rgba(var(--color-${color}) / 1)`;
            flash_timeout = setTimeout(() => {
                light.style.backgroundColor = `rgba(var(--color-surface-900) / 1)`;
                if (after_cb) flash_timeout = setTimeout(after_cb, letter_break_time);
            }, dash_time);
        }

        const flash = (i: number) => {
            if (i >= morse_tx_sequence.length) {
                flash_timeout = setTimeout(() => { flash_color('success-500'); }, 1000);
                return;
            };

            light.style.backgroundColor = `rgba(var(--color-surface-${i % 2 === 0 ? 50 : 900}) / 1)`;
            flash_timeout = setTimeout(() => {
                flash(i + 1);
            }, morse_tx_sequence[i]);
        }

        flash_color('warning-500', () => {
            flash(0);
            rx_start = Date.now();
        });
    }

    const start_rx = () => {
        if (flash_timeout) clearTimeout(flash_timeout);

        rx_target = Array.from({length: letter_count}, () => {
            const c = Math.floor(Math.random() * 36);
            return c < 26 ? String.fromCharCode(65 + c) : String.fromCharCode(22 + c);
        }).join('');
        rx_cols = Math.min(10, Math.ceil(Math.sqrt(letter_count)));
        rx_rows = Math.ceil(letter_count / rx_cols);
        rx_actual = '';

        start_lights_tx(rx_target, rx_flashing_light);
    }

    const validate_rx = () => {
        rx_actual = rx_actual.toUpperCase();
        if (flash_timeout) clearTimeout(flash_timeout);
        flash_timeout = null;
        if (rx_target.length === 0) return;

        const rx_dur = (Date.now() - rx_start) / 1000;
        rx_time = `${Math.floor(rx_dur / 60)}m ${Math.floor(rx_dur % 60).toString().padStart(2, '0')}s`;

        rx_correct = 0;
        const rx_len = Math.min(rx_target.length, rx_actual.length);
        for (let i = 0; i < rx_len; i++) {
            if (rx_actual[i] === rx_target[i]) rx_correct++;
        }
    }

    const stop_rx = () => {
        if (flash_timeout) clearTimeout(flash_timeout);
        rx_target = '';
    }

    onMount(() => {

    });
</script>

<div class="container h-full mx-auto flex justify-center items-center">
    <div class="card p-4 w-full">
		<header class="card-header">
			<h3 class="h3">Morse sprejem</h3>
		</header>
        <!-- <div class="flashing-light" bind:this={flashing_light}></div>
        <button on:click={start_lights_tx}>flashing lights</button> -->
        <section class="p-4 space-y-2" hidden={rx_target !== ''}>
            <label for="dot_time" class="label">
                <span>Pika čas (ms)</span>
                <input class="input" title="Input (number)" type="number" id="dot_time" bind:value={dot_time} />
            </label>
            <label for="dash_time" class="label">
                <span>Črtica čas (ms)</span>
                <input class="input" title="Input (number)" type="number" id="dash_time" bind:value={dash_time} />
            </label>

            <label for="signal_break_time" class="label">
                <span>Pavza med znaki (ms)</span>
                <input class="input" title="Input (number)" type="number" id="signal_break_time" bind:value={signal_break_time} />
            </label>

            <label for="letter_break_threshold" class="label">
                <span>Pavza med črkami (ms)</span>
                <input class="input" title="Input (number)" type="number" id="letter_break_threshold" bind:value={letter_break_time} />
            </label>

            <label for="letter_count" class="label">
                <span>Število znakov</span>
                <input class="input" title="Input (number)" type="number" id="letter_count" bind:value={letter_count} />
            </label>

            <div class="card bg-primary-500 text-white p-4 rounded-lg flex justify-begin items-center flex-col gap-2">
                <h3 class="h3">Poizkusi sprejem</h3>
                <label for="test_tx">
                    <span class="h5">Vnesi besedilo</span>
                    <input class="input" type="text" id="test_tx" bind:value={rx_target_tryitout} />
                </label>
                <div class="flashing-light" bind:this={flashing_light_tryitout}></div>
                <button class="btn variant-filled-secondary" on:click={() => {start_lights_tx(rx_target_tryitout, flashing_light_tryitout)}}>Oddaj</button>
            </div>
            
            <p class="lead">Med sprejemom v polje za besedilo vnesi znak ali presledek da preskočiš znak</p>
            <div class="flex justify-center gap-2">
                <button class="btn variant-filled-primary" on:click={start_rx}>Začni</button>
                <a class="btn variant-filled-secondary" href="/">Nazaj</a>
            </div>
        </section>
        <section class="p-4 space-y-2" hidden={rx_target === ''}>
            <div class="card bg-primary-500 text-white p-4 rounded-lg flex justify-begin items-center flex-col gap-2">
                <div class="flex justify-center p-2 flex-col items-center gap-2">
                    <div class="flashing-light" bind:this={rx_flashing_light} hidden={flash_timeout === null}></div>
                    {#if flash_timeout}
                        <label for="rx_actual">
                            <span class="h5">Prejeto:</span>
                            <input class="input" type="text" id="rx_actual" bind:value={rx_actual} />
                        </label>
                        <button class="btn variant-filled-primary" on:click={validate_rx}>Zaključi sprejem</button>
                    {:else}
                        <h5 class="h5">Sprejem končan</h5>
                        <table class="table-auto text-center">
                            {#each Array(rx_rows) as _, row}
                                <tr>
                                    {#each Array(rx_cols) as _, col}
                                        {@const i = row * rx_cols + col}
                                        <td class="p-2 border border-gray-300">
                                            {#if i < rx_target.length}
                                                {#if i >= rx_actual.length}
                                                    <span class="variant-filled-error">{rx_target[i]}</span>
                                                {:else}
                                                    {#if rx_actual[i] !== rx_target[i]}
                                                        <span class="variant-filled-error">{rx_actual[i]}</span>/{rx_target[i]}
                                                    {:else}
                                                        {rx_actual[i]}
                                                    {/if}
                                                {/if}
                                                <br>
                                                {morse_encode(rx_target[i])}
                                            {/if}
                                        </td>
                                    {/each}
                                </tr>
                            {/each}
                        </table>
                        <p>Pravilno: {rx_correct}/{rx_target.length} ({Math.round(100 * rx_correct / rx_target.length)}%)</p>
                        <p>Čas: {rx_time}</p>
                    {/if}
                </div>
            </div>
            <div class="flex justify-center gap-2">
                <button class="btn variant-filled-error" on:click={stop_rx}>Končaj</button>
                <button class="btn variant-filled-primary" on:click={start_rx}>Ponovi</button>
            </div>
        </section>
        <!--
        <section class="p-4 space-y-2" hidden={tx_target === ''} >
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
                                            {:else}
                                                {tx_actual_decoded[i]}
                                            {/if}
                                            <br>
                                            {tx_actual[i]}
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

        </section> -->
	</div>
</div>

<style>
    .flashing-light {
        width: 8rem;
        height: 8rem;
        border-radius: 100%;
        background-color: rgba(var(--color-surface-900) / 1);
        box-shadow: 0 0 1rem black;
    }
</style>