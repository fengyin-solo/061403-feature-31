import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useGame() {
  const temperature = ref(80)
  const heat = ref(50)
  const wood = ref(10)
  const food = ref(5)
  const hide = ref(0)
  const tools = ref(0)
  const isDay = ref(true)
  const dayCount = ref(1)
  const isBlizzard = ref(false)
  const gameOver = ref(false)
  const gameOverReason = ref('')
  const actionLog = ref([])

  const coldExposure = ref(0)
  const satiety = ref(80)
  const fatigue = ref(20)

  const DAY_DURATION = 30000
  const NIGHT_DURATION = 20000
  const HEAT_CONSUMPTION_RATE = 2
  const BLIZZARD_CHANCE = 0.15
  const SATIETY_DECAY_DAY = 0.5
  const SATIETY_DECAY_NIGHT = 0.3
  const FATIGUE_DECAY_REST = 0.8

  let dayNightTimer = null
  let nightConsumptionTimer = null
  let autoSaveTimer = null
  let statusDecayTimer = null

  const isNight = computed(() => !isDay.value)
  const isDanger = computed(() => temperature.value < 30)
  const canMakeFire = computed(() => wood.value >= 3)
  const canHunt = computed(() => tools.value > 0)
  const huntSuccessRate = computed(() => 0.3 + tools.value * 0.15)

  const isColdDanger = computed(() => coldExposure.value >= 70)
  const isHungerDanger = computed(() => satiety.value <= 20)
  const isFatigueDanger = computed(() => fatigue.value >= 80)
  const canRest = computed(() => isNight.value && !gameOver.value)

  function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    actionLog.value.unshift({ message, type, timestamp })
    if (actionLog.value.length > 20) {
      actionLog.value.pop()
    }
  }

  function checkGameOver() {
    if (temperature.value <= 20) {
      gameOver.value = true
      gameOverReason.value = '体温过低，你在严寒中失去了意识...'
      stopTimers()
      addLog('游戏结束：体温过低！', 'danger')
      return
    }
    if (satiety.value <= 0) {
      gameOver.value = true
      gameOverReason.value = '你因饥饿而倒下，再也无法站起来...'
      stopTimers()
      addLog('游戏结束：饥饿致死！', 'danger')
      return
    }
    if (fatigue.value >= 100) {
      gameOver.value = true
      gameOverReason.value = '你因过度疲劳而晕厥，在寒夜中永远沉睡...'
      stopTimers()
      addLog('游戏结束：疲劳过度！', 'danger')
      return
    }
    if (temperature.value >= 100) {
      temperature.value = 100
    }
    if (coldExposure.value >= 100) {
      coldExposure.value = 100
    }
    if (fatigue.value >= 100) {
      fatigue.value = 100
    }
    if (satiety.value <= 0) {
      satiety.value = 0
    }
  }

  function consumeHeat() {
    if (gameOver.value) return
    
    const multiplier = isBlizzard.value ? 2 : 1
    const consumption = HEAT_CONSUMPTION_RATE * multiplier
    const coldIncrease = 2 * multiplier
    
    if (heat.value >= consumption) {
      heat.value -= consumption
      if (temperature.value < 80) {
        temperature.value = Math.min(80, temperature.value + 1)
      }
      coldExposure.value = Math.max(0, coldExposure.value - 1)
    } else {
      heat.value = 0
      temperature.value = Math.max(0, temperature.value - consumption)
      coldExposure.value = Math.min(100, coldExposure.value + coldIncrease)
      addLog('热量不足！体温正在下降，受寒加剧...', 'warning')
    }
    
    checkGameOver()
  }

  function decayStatus() {
    if (gameOver.value) return
    
    const decayMultiplier = isBlizzard.value ? 1.5 : 1
    
    if (isDay.value) {
      satiety.value = Math.max(0, satiety.value - SATIETY_DECAY_DAY)
    } else {
      satiety.value = Math.max(0, satiety.value - SATIETY_DECAY_NIGHT)
    }
    
    if (isNight.value && heat.value > 20) {
      fatigue.value = Math.max(0, fatigue.value - FATIGUE_DECAY_REST)
      coldExposure.value = Math.max(0, coldExposure.value - 0.5)
    }
    
    if (coldExposure.value > 30) {
      temperature.value = Math.max(0, temperature.value - 0.3 * decayMultiplier)
    }
    
    if (satiety.value < 30) {
      fatigue.value = Math.min(100, fatigue.value + 0.5)
    }
    
    if (satiety.value <= 10 && satiety.value > 0) {
      addLog('你感到饥肠辘辘...', 'warning')
    }
    if (fatigue.value >= 70 && fatigue.value < 80) {
      addLog('你感到非常疲惫...', 'warning')
    }
    if (coldExposure.value >= 60 && coldExposure.value < 70) {
      addLog('寒风刺骨，你快冻僵了...', 'warning')
    }
    
    checkGameOver()
  }

  function startNightCycle() {
    addLog(`夜幕降临，第 ${dayCount.value} 天结束`, 'info')
    nightConsumptionTimer = setInterval(() => {
      consumeHeat()
    }, 1000)
    
    if (Math.random() < BLIZZARD_CHANCE) {
      triggerBlizzard()
    }
  }

  function startDayCycle() {
    dayCount.value++
    addLog(`天亮了，第 ${dayCount.value} 天开始`, 'success')
    isBlizzard.value = false
    if (nightConsumptionTimer) {
      clearInterval(nightConsumptionTimer)
      nightConsumptionTimer = null
    }
  }

  function toggleDayNight() {
    isDay.value = !isDay.value
    if (isDay.value) {
      startDayCycle()
    } else {
      startNightCycle()
    }
  }

  function triggerBlizzard() {
    isBlizzard.value = true
    addLog('⚠️ 暴风雪来袭！所有消耗加倍！', 'danger')
  }

  function chopWood() {
    if (gameOver.value || isNight.value) return
    if (fatigue.value >= 90) {
      addLog('你太累了，无法砍柴！先休息一下吧。', 'warning')
      return
    }
    
    const multiplier = isBlizzard.value ? 2 : 1
    const tempCost = 5 * multiplier
    const coldIncrease = 8 * multiplier
    const fatigueIncrease = 12
    const satietyCost = 3
    
    temperature.value = Math.max(0, temperature.value - tempCost)
    coldExposure.value = Math.min(100, coldExposure.value + coldIncrease)
    fatigue.value = Math.min(100, fatigue.value + fatigueIncrease)
    satiety.value = Math.max(0, satiety.value - satietyCost)
    
    const woodGained = Math.floor(Math.random() * 3) + 2
    wood.value += woodGained
    
    addLog(`砍柴：获得 ${woodGained} 木头，体温-${tempCost}，受寒+${coldIncrease}，疲劳+${fatigueIncrease}，饱腹-${satietyCost}`, 'action')
    
    if (Math.random() < BLIZZARD_CHANCE * 0.5) {
      triggerBlizzard()
    }
    
    checkGameOver()
  }

  function hunt() {
    if (gameOver.value || isNight.value) return
    if (fatigue.value >= 85) {
      addLog('你太累了，无法狩猎！先休息一下吧。', 'warning')
      return
    }
    
    const multiplier = isBlizzard.value ? 2 : 1
    const tempCost = 8 * multiplier
    const coldIncrease = 10 * multiplier
    const fatigueIncrease = 18
    const satietyCost = 5
    
    temperature.value = Math.max(0, temperature.value - tempCost)
    coldExposure.value = Math.min(100, coldExposure.value + coldIncrease)
    fatigue.value = Math.min(100, fatigue.value + fatigueIncrease)
    satiety.value = Math.max(0, satiety.value - satietyCost)
    
    if (Math.random() < huntSuccessRate.value) {
      const foodGained = Math.floor(Math.random() * 3) + 2
      const hideGained = Math.floor(Math.random() * 2) + 1
      food.value += foodGained
      hide.value += hideGained
      addLog(`狩猎成功：获得 ${foodGained} 食物，${hideGained} 兽皮，体温-${tempCost}，受寒+${coldIncrease}，疲劳+${fatigueIncrease}，饱腹-${satietyCost}`, 'success')
    } else {
      addLog(`狩猎失败：体温-${tempCost}，受寒+${coldIncrease}，疲劳+${fatigueIncrease}，饱腹-${satietyCost}，空手而归`, 'warning')
    }
    
    if (Math.random() < BLIZZARD_CHANCE * 0.5) {
      triggerBlizzard()
    }
    
    checkGameOver()
  }

  function makeTools() {
    if (gameOver.value || isNight.value) return
    if (wood.value < 2 || hide.value < 1) {
      addLog('材料不足：需要 2 木头和 1 兽皮', 'warning')
      return
    }
    if (fatigue.value >= 88) {
      addLog('你太累了，无法制作工具！先休息一下吧。', 'warning')
      return
    }
    
    const multiplier = isBlizzard.value ? 2 : 1
    const tempCost = 6 * multiplier
    const coldIncrease = 5 * multiplier
    const fatigueIncrease = 10
    const satietyCost = 2
    
    wood.value -= 2
    hide.value -= 1
    tools.value += 1
    temperature.value = Math.max(0, temperature.value - tempCost)
    coldExposure.value = Math.min(100, coldExposure.value + coldIncrease)
    fatigue.value = Math.min(100, fatigue.value + fatigueIncrease)
    satiety.value = Math.max(0, satiety.value - satietyCost)
    
    addLog(`制作工具：获得 1 工具，体温-${tempCost}，受寒+${coldIncrease}，疲劳+${fatigueIncrease}，饱腹-${satietyCost}`, 'success')
    checkGameOver()
  }

  function makeFire() {
    if (gameOver.value || !canMakeFire.value) {
      addLog('木头不足：生火需要 3 木头', 'warning')
      return
    }
    if (fatigue.value >= 95) {
      addLog('你太累了，连生火的力气都没有了！', 'warning')
      return
    }
    
    const fatigueIncrease = 5
    
    wood.value -= 3
    const heatGained = Math.floor(Math.random() * 20) + 25
    heat.value = Math.min(100, heat.value + heatGained)
    temperature.value = Math.min(100, temperature.value + 10)
    coldExposure.value = Math.max(0, coldExposure.value - 25)
    fatigue.value = Math.min(100, fatigue.value + fatigueIncrease)
    
    addLog(`生火：获得 ${heatGained} 热量，体温+10，受寒-25，疲劳+${fatigueIncrease}`, 'success')
  }

  function eatFood() {
    if (gameOver.value || food.value < 1) {
      addLog('没有食物了！', 'warning')
      return
    }
    
    food.value -= 1
    const tempGained = Math.floor(Math.random() * 10) + 5
    const satietyGained = Math.floor(Math.random() * 20) + 25
    temperature.value = Math.min(100, temperature.value + tempGained)
    satiety.value = Math.min(100, satiety.value + satietyGained)
    coldExposure.value = Math.max(0, coldExposure.value - 5)
    
    addLog(`进食：体温+${tempGained}，饱腹+${satietyGained}，受寒-5`, 'success')
  }

  function rest() {
    if (gameOver.value || !canRest.value) return
    if (heat.value < 10) {
      addLog('太冷了，无法安然入睡！先生火取暖吧。', 'warning')
      return
    }
    
    const fatigueRecovered = Math.floor(Math.random() * 15) + 10
    const coldRecovered = Math.floor(Math.random() * 8) + 5
    const heatCost = 8
    const satietyCost = 2
    
    fatigue.value = Math.max(0, fatigue.value - fatigueRecovered)
    coldExposure.value = Math.max(0, coldExposure.value - coldRecovered)
    heat.value = Math.max(0, heat.value - heatCost)
    satiety.value = Math.max(0, satiety.value - satietyCost)
    
    if (heat.value < heatCost) {
      temperature.value = Math.max(0, temperature.value - 3)
    }
    
    addLog(`休息：疲劳-${fatigueRecovered}，受寒-${coldRecovered}，热量-${heatCost}，饱腹-${satietyCost}`, 'action')
    checkGameOver()
  }

  function startTimers() {
    dayNightTimer = setInterval(() => {
      toggleDayNight()
    }, isDay.value ? DAY_DURATION : NIGHT_DURATION)
    
    autoSaveTimer = setInterval(() => {
      saveGame('auto')
    }, 10000)

    statusDecayTimer = setInterval(() => {
      decayStatus()
    }, 2000)
  }

  function stopTimers() {
    if (dayNightTimer) {
      clearInterval(dayNightTimer)
      dayNightTimer = null
    }
    if (nightConsumptionTimer) {
      clearInterval(nightConsumptionTimer)
      nightConsumptionTimer = null
    }
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
    if (statusDecayTimer) {
      clearInterval(statusDecayTimer)
      statusDecayTimer = null
    }
  }

  function saveGame(slot = 'manual') {
    const gameState = {
      temperature: temperature.value,
      heat: heat.value,
      wood: wood.value,
      food: food.value,
      hide: hide.value,
      tools: tools.value,
      isDay: isDay.value,
      dayCount: dayCount.value,
      isBlizzard: isBlizzard.value,
      coldExposure: coldExposure.value,
      satiety: satiety.value,
      fatigue: fatigue.value,
      savedAt: Date.now()
    }
    localStorage.setItem(`snowSurvival_${slot}`, JSON.stringify(gameState))
    addLog(`游戏已保存到存档位：${slot === 'auto' ? '自动存档' : slot}`, 'info')
  }

  function loadGame(slot = 'auto') {
    const saved = localStorage.getItem(`snowSurvival_${slot}`)
    if (!saved) {
      addLog('没有找到存档', 'warning')
      return false
    }
    
    try {
      const gameState = JSON.parse(saved)
      temperature.value = gameState.temperature
      heat.value = gameState.heat
      wood.value = gameState.wood
      food.value = gameState.food
      hide.value = gameState.hide
      tools.value = gameState.tools
      isDay.value = gameState.isDay
      dayCount.value = gameState.dayCount
      isBlizzard.value = gameState.isBlizzard
      coldExposure.value = gameState.coldExposure ?? 0
      satiety.value = gameState.satiety ?? 80
      fatigue.value = gameState.fatigue ?? 20
      gameOver.value = false
      gameOverReason.value = ''
      actionLog.value = []
      
      stopTimers()
      startTimers()
      
      if (!isDay.value) {
        startNightCycle()
      }
      
      addLog(`成功加载存档：${slot === 'auto' ? '自动存档' : slot}`, 'success')
      return true
    } catch (e) {
      addLog('存档损坏，无法加载', 'danger')
      return false
    }
  }

  function getSaveSlots() {
    const slots = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('snowSurvival_')) {
        const slotName = key.replace('snowSurvival_', '')
        try {
          const data = JSON.parse(localStorage.getItem(key))
          slots.push({
            name: slotName,
            dayCount: data.dayCount,
            savedAt: data.savedAt
          })
        } catch (e) {}
      }
    }
    return slots
  }

  function deleteSave(slot) {
    localStorage.removeItem(`snowSurvival_${slot}`)
    addLog(`已删除存档：${slot}`, 'info')
  }

  function restartGame() {
    temperature.value = 80
    heat.value = 50
    wood.value = 10
    food.value = 5
    hide.value = 0
    tools.value = 0
    isDay.value = true
    dayCount.value = 1
    isBlizzard.value = false
    coldExposure.value = 0
    satiety.value = 80
    fatigue.value = 20
    gameOver.value = false
    gameOverReason.value = ''
    actionLog.value = []
    
    stopTimers()
    startTimers()
    
    addLog('新游戏开始！注意保暖、进食和休息，祝你好运！', 'success')
  }

  onMounted(() => {
    startTimers()
    addLog('欢迎来到雪地生存！白天收集资源，夜晚保持温暖。', 'info')
  })

  onUnmounted(() => {
    stopTimers()
  })

  return {
    temperature,
    heat,
    wood,
    food,
    hide,
    tools,
    isDay,
    isNight,
    dayCount,
    isBlizzard,
    coldExposure,
    satiety,
    fatigue,
    gameOver,
    gameOverReason,
    actionLog,
    isDanger,
    isColdDanger,
    isHungerDanger,
    isFatigueDanger,
    canMakeFire,
    canHunt,
    canRest,
    huntSuccessRate,
    chopWood,
    hunt,
    makeTools,
    makeFire,
    eatFood,
    rest,
    saveGame,
    loadGame,
    getSaveSlots,
    deleteSave,
    restartGame
  }
}
