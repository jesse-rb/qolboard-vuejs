<script lang="ts">
    import { getContext, createEventDispatcher, SvelteComponent } from "svelte";
    import Button from "../Button.svelte";
    import Modal from "../Modal.svelte";
    import { CanvasModes } from "./enums/modes";
    import { CanvasActions } from "./enums/actions";
    import type { CanvasStore as CanvasStore } from "./types/canvas";
    import type { Writable } from "svelte/store";
    import { appStore } from '../../store';
    import Toggle from "../Inputs/Toggle.svelte";

    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    const dispatch = createEventDispatcher();

    export let saveIsLoading = false;
    let isExpanded = false;

    $: if ($appStore.controlPanelWidth) {
        document.body.style.setProperty('--control-panel-width', `${$appStore.controlPanelWidth}px`);
    }

    let brushSettingsModal:SvelteComponent;

    function dispatchSetActiveMode(mode: CanvasModes) {
        dispatch('setActiveMode', mode);
    }

    function dispatchAction(action: CanvasActions) {
        dispatch('action', action);
    }

    function dispatchUpdatedBackgroundColor() {
        dispatch('updatedBackgroundColor');
    }

    function dispatchSave() {
        dispatch('save');
    }
</script>

<div bind:clientWidth={$appStore.controlPanelWidth} class="control-panel {isExpanded ? "px-4 w-full sm:max-w-lg" : "w-fit"}" class:is-expanded={isExpanded}>
    <div class="w-full sticky top-0 bg-back pt-4 pb-4 border-b-[1px] border-fore">
        <div class="flex flex-wrap gap-2 {isExpanded ? "justify-start" : "items-center flex-col"}">
            <Button
                onclick={()=>{isExpanded = !isExpanded}}
                icon="{isExpanded ? "chevron_right" : "chevron_left"}"
            />

            {#if $appStore.isAuthenticated}
                <Button icon="save" label="{isExpanded ? "save" : ""}" onclick={dispatchSave} isLoading={saveIsLoading} />
            {/if}
        </div>
        <!--canvas name & save-->
        {#if $appStore.isAuthenticated}
            <div class="control-group sticky">
                {#if isExpanded}
                    <h1>
                        <input
                            class="w-full"
                            type="text"
                            bind:value={$canvasStore.name}
                        >
                    </h1>
                {/if}
            </div>
        {/if}
    </div>
    <!--modes-->
    <div class="control-group">
        <h1 class:hidden={!isExpanded}>Tools</h1>
        <Button icon="brush" active={$canvasStore.activeMode==CanvasModes.Draw} label="{isExpanded ? "draw" : ""}" onclick={()=>dispatchSetActiveMode(CanvasModes.Draw)} />
        <Button icon="pan_tool_alt" active={$canvasStore.activeMode==CanvasModes.Grab} label="{isExpanded ? "grab" : ""}" onclick={()=>dispatchSetActiveMode(CanvasModes.Grab)} />
        <Button icon="pan_tool" active={$canvasStore.activeMode==CanvasModes.Pan} label="{isExpanded ? "pan (Hold Space)" : ""}" onclick={()=>dispatchSetActiveMode(CanvasModes.Pan)} />
        <Button icon="delete" active={$canvasStore.activeMode==CanvasModes.Remove} label="{isExpanded ? "remove" : ""}" onclick={()=>dispatchSetActiveMode(CanvasModes.Remove)} />
    </div>
        
    <!--global actions-->
    <div class="control-group">
        <h1 class:hidden={!isExpanded} >Canvas Settings</h1>
        <span>zoom: <em>{$canvasStore.zoom.toFixed(2)}</em></span>
        <div class="control">
            <label class:hidden={!isExpanded} for="">background color</label>
            <input bind:value={$canvasStore.backgroundColor} type="color" on:input={dispatchUpdatedBackgroundColor} >
        </div>
        <div class="control">
            <label class:hidden={!isExpanded} for="">show units</label>
            <Toggle bind:value={$canvasStore.rulerSettings.showUnits} />
        </div>
        <div class="control">
            <label class:hidden={!isExpanded} for="">show grid</label>
            <Toggle bind:value={$canvasStore.rulerSettings.showLines} />
        </div>
        <div class="control">
            <label class:hidden={!isExpanded} for="">snap to grid</label>
            <Toggle bind:value={$canvasStore.snapToGrid} disabled={true} />
        </div>
        <div class="control">
            <Button icon="clear_all" label="{isExpanded ? "clear all" : ""}" onclick={()=>dispatchAction(CanvasActions.Clear)} />
        </div>
    </div>

    <!--piece settings-->
    <div class="control-group">
        <h1 class:hidden={!isExpanded} >Piece Settings</h1>
        <div class="control">
            <label class:hidden={!isExpanded} for="">size</label>
            <input class:w-12={!isExpanded} bind:value={$canvasStore.pieceSettings.size} type="range" min="1" step="1" max="100" >
        </div>
        <div class="control">
            <label class:hidden={!isExpanded} for="">color</label>
            <input bind:value={$canvasStore.pieceSettings.color} type="color" >
        </div>
    </div>
</div>

<Modal bind:this={brushSettingsModal}>
    
</Modal>

<style lang="postcss">
    .control-panel {
        @apply gap-12;
        @apply absolute;
        @apply top-[var(--header-height)];
        @apply items-center;
        @apply flex;
        @apply flex-col;
        @apply bottom-0;
        @apply right-0;
        @apply overflow-y-auto;
        @apply overflow-x-hidden;
        @apply bg-back;
        @apply z-30;
    }
    .control-group {
        @apply w-full;
        @apply flex;
        @apply flex-col;
        @apply flex-wrap;
        @apply items-center;
        @apply gap-2;
    }
    .is-expanded .control-group {
        @apply items-stretch;
    }
    .control {
        @apply flex;
        @apply flex-col;
    }
</style>
