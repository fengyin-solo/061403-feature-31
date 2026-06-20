<template>
  <div class="action-panel">
    <h3 class="panel-title">行动</h3>
    <div v-if="isNight" class="night-warning">
      <span>🌙 夜晚无法外出活动，请保持温暖！</span>
    </div>
    <div class="actions-grid">
      <button 
        class="action-btn" 
        :class="{ disabled: isNight || gameOver || fatigue >= 90 }"
        @click="$emit('chop')"
      >
        <span class="btn-icon">🪓</span>
        <span class="btn-text">砍柴</span>
        <span class="btn-costs">
          <span class="cost-item">体温-5</span>
          <span class="cost-item cold">受寒+8</span>
          <span class="cost-item fatigue">疲劳+12</span>
          <span class="cost-item hunger">饱腹-3</span>
        </span>
      </button>
      <button 
        class="action-btn" 
        :class="{ disabled: isNight || gameOver || fatigue >= 85 }"
        @click="$emit('hunt')"
      >
        <span class="btn-icon">🏹</span>
        <span class="btn-text">狩猎</span>
        <span class="btn-costs">
          <span class="cost-item">体温-8</span>
          <span class="cost-item cold">受寒+10</span>
          <span class="cost-item fatigue">疲劳+18</span>
          <span class="cost-item hunger">饱腹-5</span>
        </span>
        <span class="btn-hint">成功率: {{ Math.round(huntRate * 100) }}%</span>
      </button>
      <button 
        class="action-btn" 
        :class="{ disabled: isNight || gameOver || !canCraft || fatigue >= 88 }"
        @click="$emit('craft')"
      >
        <span class="btn-icon">🔨</span>
        <span class="btn-text">制作工具</span>
        <span class="btn-costs">
          <span class="cost-item">体温-6</span>
          <span class="cost-item cold">受寒+5</span>
          <span class="cost-item fatigue">疲劳+10</span>
          <span class="cost-item hunger">饱腹-2</span>
        </span>
        <span class="btn-hint">需要: 2🪵 + 1🦊</span>
      </button>
      <button 
        class="action-btn fire-btn" 
        :class="{ disabled: !canFire || gameOver || fatigue >= 95 }"
        @click="$emit('fire')"
      >
        <span class="btn-icon">🔥</span>
        <span class="btn-text">生火</span>
        <span class="btn-costs">
          <span class="cost-item">木头-3</span>
          <span class="cost-item cold good">受寒-25</span>
          <span class="cost-item fatigue">疲劳+5</span>
        </span>
        <span class="btn-hint good">+25~45 热量, +10 体温</span>
      </button>
      <button 
        class="action-btn food-btn" 
        :class="{ disabled: food <= 0 || gameOver }"
        @click="$emit('eat')"
      >
        <span class="btn-icon">🍖</span>
        <span class="btn-text">进食</span>
        <span class="btn-costs">
          <span class="cost-item">食物-1</span>
          <span class="cost-item good">饱腹+25~45</span>
          <span class="cost-item cold good">受寒-5</span>
        </span>
        <span class="btn-hint good">+5~15 体温</span>
      </button>
      <button 
        class="action-btn rest-btn" 
        :class="{ disabled: !canRest || gameOver }"
        @click="$emit('rest')"
      >
        <span class="btn-icon">😴</span>
        <span class="btn-text">休息</span>
        <span class="btn-costs">
          <span class="cost-item">热量-8</span>
          <span class="cost-item hunger">饱腹-2</span>
        </span>
        <span class="btn-hint good">疲劳-10~25, 受寒-5~13</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isNight: { type: Boolean, default: false },
  gameOver: { type: Boolean, default: false },
  canFire: { type: Boolean, default: false },
  canCraft: { type: Boolean, default: false },
  canRest: { type: Boolean, default: false },
  huntRate: { type: Number, default: 0.3 },
  food: { type: Number, default: 0 },
  fatigue: { type: Number, default: 0 }
})

defineEmits(['chop', 'hunt', 'craft', 'fire', 'eat', 'rest'])
</script>

<style scoped>
.action-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  color: white;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.night-warning {
  background: rgba(50, 50, 100, 0.8);
  border: 1px solid rgba(100, 100, 200, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  text-align: center;
  color: #a0c4ff;
  font-size: 14px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-3px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.action-btn:active:not(.disabled) {
  transform: translateY(-1px);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.fire-btn:not(.disabled) {
  border-color: rgba(255, 100, 50, 0.6);
  background: linear-gradient(135deg, rgba(255, 100, 50, 0.3), rgba(255, 50, 0, 0.1));
}

.fire-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(255, 100, 50, 0.4);
}

.food-btn:not(.disabled) {
  border-color: rgba(50, 200, 100, 0.6);
  background: linear-gradient(135deg, rgba(50, 200, 100, 0.3), rgba(0, 150, 50, 0.1));
}

.food-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(50, 200, 100, 0.4);
}

.rest-btn:not(.disabled) {
  border-color: rgba(155, 89, 182, 0.6);
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(142, 68, 173, 0.1));
}

.rest-btn:hover:not(.disabled) {
  box-shadow: 0 5px 20px rgba(155, 89, 182, 0.4);
}

.btn-icon {
  font-size: 26px;
}

.btn-text {
  font-size: 13px;
  font-weight: bold;
}

.btn-costs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3px;
}

.cost-item {
  font-size: 10px;
  color: rgba(255, 180, 180, 0.9);
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 5px;
  border-radius: 4px;
}

.cost-item.cold {
  color: rgba(150, 200, 255, 0.9);
}

.cost-item.fatigue {
  color: rgba(255, 200, 150, 0.9);
}

.cost-item.hunger {
  color: rgba(200, 255, 200, 0.9);
}

.cost-item.good {
  color: rgba(150, 255, 150, 0.95);
  background: rgba(46, 204, 113, 0.2);
}

.btn-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.btn-hint.good {
  color: rgba(150, 255, 150, 0.9);
}
</style>
