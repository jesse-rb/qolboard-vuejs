<script>
    import { get } from "svelte/store";
    import { getContext, tick } from "svelte";
    import Piece from "./Piece.svelte";

    const canvasStore = getContext('canvasStore');
    let selectedPiece = null;
    let selectedPieceIndex = null;
    let pieces = [];

    let leftMost;
    let rightMost;
    let topMost;
    let bottomMost;

    function updateBoundingBox(topRightBottomLeft) {
        topMost = topMost < topRightBottomLeft.topMost ? topMost : topRightBottomLeft.topMost;
        rightMost = rightMost > topRightBottomLeft.rightMost ? rightMost : topRightBottomLeft.rightMost;
        bottomMost = bottomMost > topRightBottomLeft.bottomMost ? bottomMost : topRightBottomLeft.bottomMost;
        leftMost = leftMost < topRightBottomLeft.leftMost ? leftMost : topRightBottomLeft.leftMost;
    }

    export function serialize() {
        const s = {
            pieces: [],
            leftMost: leftMost,
            rightMost: rightMost,
            topMost: topMost,
            bottomMost: bottomMost
        };
        
        for (const p of pieces) {
            if (p.component) {
                const serializedPiece = p.component.serialize();
                s.pieces.push(serializedPiece);
            }
        }
        return s;
    }

    export async function deserialize(s) {
        leftMost = s.leftMost;
        rightMost = s.rightMost;
        topMost = s.topMost;
        bottomMost = s.bottomMost;
    
        for (const serializedPiece of s.pieces) {
            const p = {component:null};
            pieces = [...pieces, p];
            await tick();
            p.component.deserialize(serializedPiece);
        }
    }

    export function clear() {
        deselect();
        pieces = [];
    }

    export function addPiece() {
        deselect();
        const newPiece = {component:null};
        pieces = [...pieces, newPiece];
        
        selectedPiece = newPiece;
        selectedPieceIndex = pieces.length-1;
    }

    export function addPointToLatestPiece() {
        if (pieces.length && pieces[pieces.length-1].component) {
            let p = pieces[pieces.length-1].component;
            p.addPoint();
        }
    }

    export function draw() {
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].component && pieces[i].component.draw();
        }
    }

    export function redrawPieceChunk(piece, redrawPiece=true) {
        piece.component.clearBoundingBox();
        // Only redraw pieces that are inbound of section
        for (const p of pieces) {
            if ( !redrawPiece && p === piece ) {
                continue;
            }
            if (piece.component.doesBoundingBoxOverlap(p.component)) {
                p.component.draw();
            }
        }
    }

    export function reDrawSelectedChunk() {
        // Draw only section background
        if (selectedPiece) {
            redrawPieceChunk(selectedPiece);
        }
    }

    export function deselect() {
        // Deselect old selected piece
        if (selectedPiece) {
            selectedPiece.component.deselect();
            reDrawSelectedChunk();
        }
        selectedPiece = null;
        selectedPieceIndex = null;
    }

    export function select() {
        deselect();
        // Select new piece
        for (let i=pieces.length-1; i>=0; i--) {
            const piece = pieces[i];
            if (piece.component.isPointInStroke($canvasStore.mouseX*$canvasStore.zoom, $canvasStore.mouseY*$canvasStore.zoom)) {
                console.log('SELECTED');
                selectedPiece = piece;
                selectedPieceIndex = i;
                selectedPiece.component.select();

                reDrawSelectedChunk();
                return;
            }
        }
    }

    export function pan(dx = null, dy = null) {
        for (const p of pieces) {
            p.component.move(true, dx, dy);
        }
    }

    export function move() {
        if (selectedPiece) {
            
            selectedPiece.component.clearBoundingBox();
            selectedPiece.component.move();
            reDrawSelectedChunk();
        }
    }

    export function remove() {
        if (selectedPieceIndex !== null) {
            pieces = [ ...pieces.slice(0, selectedPieceIndex), ...pieces.slice(selectedPieceIndex+1) ];

            reDrawSelectedChunk();
            deselect();
        }
    }

    export function getSelected() {
        return selectedPiece;
    }

    export function debugLogLatestPiece() {
        if (pieces.length == 0) {
            console.log('no pieces');
            return;
        }

        const latestPiece = pieces[pieces.length-1];
        console.log(latestPiece.component.getPoints());
    }

    function initialPieceSettings() {
        const canvasStoreCurrent = get(canvasStore);
        return canvasStoreCurrent.pieceSettings;
    }

</script>

<div id="pieces">
    {#each pieces as p (p)}
        <Piece 
            bind:this={p.component} 
            settings={{ ...initialPieceSettings() }} 
            on:update={(e) => redrawPieceChunk(p, e.detail)} 
            on:updateBoundingBox={(e) => updateBoundingBox(e.detail)}
        />
    {/each}
</div>

<style>
    div#pieces {
        background-color: var(--color-back-2);
    }
</style>
