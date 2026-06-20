<template>
  <div class="status-panel">
    <h3 class="panel-title">角色状态</h3>
    <div class="status-list">
      <div class="status-item" :class="{ danger: isColdDanger }">
        <div class="status-header">
          <span class="status-icon">🥶</span>
          <span class="status-name">受寒</span>
          <span class="status-value">{{ Math.round(coldExposure) }}/100</span>
        </div>
        <div class="status-bar-container">
          <div 
            class="status-bar cold-bar" 
            :style="{ width: coldExposure + '%' }"
          ></div>
        </div>
        <div class="status-hint">{{ getColdHint() }}</div>
      </div>

      <div class="status-item" :class="{ danger: isHungerDanger }">
        <div class="status-header">
          <span class="status-icon">🍗</span>
          <span class="status-name">饱腹</span>
          <span class="status-value">{{ Math.round(satiety) }}/100</span>
        </div>
        <div class="status-bar-container">
          <div 
            class="status-bar satiety-bar" 
            :style="{ width: satiety + '%' }"
          ></div>
        </div>
        <div class="status-hint">{{ getSatietyHint() }}</div>
      </div>

      <div class="status-item" :class="{ danger: isFatigueDanger }">
        <div class="status-header">
          <span class="status-icon">😴</span>
          <span class="status-name">疲劳</span>
          <span class="status-value">{{ Math.round(fatigue) }}/100</span>
        </div>
        <div class="status-bar-container">
          <div 
            class="status-bar fatigue-bar" 
            :style="{ width: fatigue + '%' }"
          ></div>
        </div>
        <div class="status-hint">{{ getFatigueHint() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  coldExposure: { type: Number, default: 0 },
  satiety: { type: Number, default: 80 },
  fatigue: { type: Number, default: 20 },
  isColdDanger: { type: Boolean, default: false },
  isHungerDanger: { type: Boolean, default: false },
  isFatigueDanger: { type: Boolean, default: false }
})

function getColdHint() {
  const v = props.coldExposure
  if (v >= 70) return '极度寒冷，危险！'
  if (v >= 50) return '很冷，注意取暖'
  if (v >= 30) return '有些冷'
  return '状态良好'
}

function getSatietyHint() {
  const v = props.satiety
  if (v <= 10) return '极度饥饿，危险！'
  if (v <= 30) return '很饿，需要进食'
  if (v <= 50) return '有些饿'
  return '饱腹感充足'
}

function getFatigueHint() {
  const v = props.fatigue
  if (v >= 80) return '精疲力竭，危险！'
  if (v >= 60) return '很疲惫，需要休息'
  if (v >= 40) return '有些累'
  return '精力充沛'
}
</script>

<style scoped>
.status-panel {
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

.status-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.status-item.danger {
  background: rgba(231, 76, 60, 0.25);
  border: 1px solid rgba(231, 76, 60, 0.5);
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 10px rgba(231, 76, 60, 0.3); }
  50% { box-shadow: 0 0 20px rgba(231, 76, 60, 0.6); }
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-icon {
  font-size: 22px;
}

.status-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: bold;
  flex: 1;
}

.status-value {
  color: white;
  font-size: 13px;
  font-weight: bold;
  font-family: monospace;
}

.status-bar-container {
  height: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 6px;
}

.status-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.4s ease;
}

.cold-bar {
  background: linear-gradient(to right, #3498db, #2980b9, #1a5276);
}

.satiety-bar {
  background: linear-gradient(to right, #27ae60, #2ecc71, #58d68d);
}

.fatigue-bar {
  background: linear-gradient(to right, #f39c12, #e67e22, #d35400);
}

.status-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-style: italic;
}

.status-item.danger .status-hint {
  color: rgba(255, 150, 150, 0.9);
}
</style>
