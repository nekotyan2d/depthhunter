<template>
    <div class="crafting">
        <div class="title">Крафты</div>
        <div v-if="selectedRecipe != null" class="crafting-table">
            <div class="ingredients">
                <Slot 
                    v-for="ingredient in sortedRecipes[selectedRecipe].ingredients" 
                    :slot="ingredient"
                    class="ingredient" :class="{disabled: !canBeCrafted(selectedRecipe)}" :selected="false"/>
            </div>
            <Icon class="arrow" icon="pixelarticons:arrow-right" height="30px" width="30px"/>
            <Slot class="result" :slot="sortedRecipes[selectedRecipe].result"/>
            <Button :disabled="!canBeCrafted(selectedRecipe)" @click="game.craftItem(selectedRecipe)">Создать</Button>
        </div>
        <div class="recipes">
            <Slot v-for="(recipe, id) in sortedRecipes" :slot="recipe.result" class="recipe" :class="{selected: selectedRecipe == +id, disabled: !canBeCrafted(+id)}" @click="selectedRecipe = +id"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetsStore } from '../stores/assets';
import Button from './Button.vue';
import Slot from './Slot.vue';
import { Icon } from "@iconify/vue";
import { useGameStore } from '../stores/game';

const assets = useAssetsStore();
const game = useGameStore();

const { craftingRecipes } = storeToRefs(assets);
const { inventory, hand, usingCraftingTable, showInventory } = storeToRefs(game);

const sortedRecipes = computed(() => {
    const sorted = Object.entries(craftingRecipes.value).filter(([, recipe]) => usingCraftingTable.value ? true : !recipe.craftingTable);
    return Object.fromEntries(sorted);
});

function canBeCrafted(id: number): boolean {
    const recipe = craftingRecipes.value[id];
    if (!recipe) return false;

    for (const ingredient of recipe.ingredients) {
        if ([...inventory.value, hand.value].filter(i => i && i.id === ingredient.id).reduce((count, slot) => count + slot!.count, 0) < ingredient.count) {
            return false;
        }
    }

    return true;
};

const selectedRecipe = ref<number | null>(null);

watch(showInventory, state => {
    if (!state) selectedRecipe.value = null;
})
</script>
<style lang="scss" scoped>
@use "../assets/scss/recipes" as *;
</style>