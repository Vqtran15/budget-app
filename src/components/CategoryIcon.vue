<template>
  <component :is="iconComp" :size="size" :color="color" :stroke-width="strokeWidth" />
</template>

<script setup>
import { computed } from 'vue'
import {
  TrendingUp, Home, Utensils, Car, ShoppingCart, Film,
  Stethoscope, Zap, ArrowLeftRight, HelpCircle, Briefcase, GraduationCap,
  Plane, Gift, Music, Dumbbell, Coffee, Book, Wrench,
  Star, Wallet, Phone, Globe, Camera, Gamepad2,
  Bike, Train, Dog, Heart, Package, PiggyBank,
  Building2, ShoppingBag, Tv, Headphones, Scissors, Baby,
} from 'lucide-vue-next'

const ICON_MAP = {
  TrendingUp, Home, Utensils, Car, ShoppingCart, Film,
  Stethoscope, Zap, ArrowLeftRight, HelpCircle, Briefcase, GraduationCap,
  Plane, Gift, Music, Dumbbell, Coffee, Book, Wrench,
  Star, Wallet, Phone, Globe, Camera, Gamepad2,
  Bike, Train, Dog, Heart, Package, PiggyBank,
  Building2, ShoppingBag, Tv, Headphones, Scissors, Baby,
}

const props = defineProps({
  name:        { type: String, required: true },
  size:        { type: Number, default: 18 },
  color:       { type: String, default: 'currentColor' },
  strokeWidth: { type: Number, default: 1.75 },
})

const iconComp = computed(() => ICON_MAP[props.name] ?? HelpCircle)
</script>
