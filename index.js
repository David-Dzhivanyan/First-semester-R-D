const form = document.getElementById('form');
const resultWrapper = document.getElementById('result-wrapper');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let result = [];
  let title;

  const count = form.elements.count.value;
  const weight = form.elements.weight.value;
  const algorithm = form.elements.algorithm.value;

  const items = createRandomArray(count, weight * 0.75);

  switch (algorithm) {
    case 'tree':
      result = branch(items, weight);
      title = 'Метод ветвей и границ'
      break;
    case 'dynamic':
      result = dynamic(items, weight);
      title = 'Динимическое программирование'
      break;
    case 'greedy':
      result = greedy(items, weight);
      title = 'Жадный алгоритм'
      break;
    default:
      result = goingThrough(items, weight);
      title = 'Метод полного перебора'
  }

  resultWrapper.querySelector('#method').textContent = title;
  resultWrapper.querySelector('#items').textContent = JSON.stringify(items);
  resultWrapper.querySelector('#weight').textContent = weight;
  resultWrapper.querySelector('#result').textContent = JSON.stringify(result);
  resultWrapper.querySelector('#backpack-weight').textContent = backpackWeight(result);
  resultWrapper.querySelector('#backpack-price').textContent = backpackPrice(result);

  resultWrapper.classList.remove('hidden');
})

function createRandomArray(size, max = 100) {
  const array = [];

  for (let i = 0; i < size; i++) {
    const weight = Math.floor(Math.random() * (max)) + 1;
    const price = Math.floor(Math.random() * (1000)) + 1;
    array.push({weight, price});
  }

  return array.sort((a, b) => a.weight - b.weight);
}

function backpackWeight(array) {
  return array.reduce((accumulator, currentValue) => accumulator += currentValue.weight, 0)
}

function backpackPrice(array) {
  return array.reduce((accumulator, currentValue) => accumulator += currentValue.price, 0)
}

function branch(array, capacity) {
  const n = array.length;
  let count = 0;
  let bestValue = 0;
  let bestSolution = [];
  let weights = array.map((e) => e.weight);
  let values = array.map((e) => e.price);

  function dfs(currentWeight, currentValue, currentSolution) {
    // Если текущий вес превышает максимальную грузоподъемность, возвращаемся
    if (currentWeight > capacity) {
      return;
    }
    count++;


    // Обновляем лучшее решение, если текущее значение больше
    if (currentValue > bestValue) {
      bestValue = currentValue;
      bestSolution = currentSolution.slice();
    }

    // Пробуем добавить каждый оставшийся предмет
    for (let i = 0; i < n; i++) {

      if (!currentSolution.includes(i)) {
        // Добавляем предмет
        currentSolution.push(i);

        dfs(currentWeight + weights[i], currentValue + values[i], currentSolution);
        currentSolution.pop(); // Откатываемся

        // Если текущее значение + оценка верхней границы меньше, чем лучшее решение, возвращаемся
        if (currentValue + calcUpperBound(currentWeight, i, values, weights) < bestValue) {
          return;
        }
      }
    }
  }

  function calcUpperBound(currentWeight, nextIndex, values, weights) {
    let bound = 0;
    for (let i = nextIndex; i < n; i++) {
      bound += values[i];
    }
    return bound;
  }

  dfs(0, 0, []);
  console.log(count);
  return bestSolution.map((_, index) => array[index]);
}
function dynamic(array, capacity) {
  let count = 0;

  const dp = new Array(array.length + 1).fill(0).map(() => new Array(capacity + 1).fill(0));
  for (let i = 0; i <= array.length; i++) {
    for (let j = 0; j <= capacity; j++) {
      dp[i][j] = 0
    }
  }

  for (let i = 1; i <= array.length; i++) {
    for (let j = 1; j <= capacity; j++) {
      count++;
      if (array[i - 1].weight <= j) {
        dp[i][j] = Math.max(
          dp[i - 1][j],
          dp[i - 1][j - array[i - 1].weight] + array[i - 1].price
        );
      } else {
        dp[i][j] = dp[i - 1][j];
      }
    }
  }

  let i = array.length, j = capacity;
  const result = [];
  while (i > 0 && j > 0) {
    count++;
    if (dp[i][j] !== dp[i - 1][j]) {
      result.push(array[i - 1]);
      j -= array[i - 1].weight;
    }
    i--;
  }

  console.log(count)

  return result;
}
function greedy(array, capacity) {
  const result = [];

  const items = array.map((item, index) => ({
    weight: item.weight,
    price: item.price,
    ratio: item.price /item.weight,
  })).sort((a, b) => b.ratio - a.ratio);

  let totalWeight = 0;

  for (const item of items) {
    if (totalWeight + item.weight <= capacity) {
      totalWeight += item.weight;
      result.push({weight: item.weight, price: item.price})
    } else {
      break;
    }
  }

  return result;
}
function goingThrough(arr, capacity) {
  let result = [];
  let count = 0;
  function getAllSubarrays(arr, currentSubarray = []) {
    count++;

    if (arr.length === 0) {
      if (backpackWeight(currentSubarray) <= capacity && backpackPrice(currentSubarray) > backpackPrice(result)) {
        result = [...currentSubarray];
      }

      return;
    }

    const firstElement = arr[0];
    const restOfArray = arr.slice(1);

    // Создаем новый подмассив без первого элемента
    getAllSubarrays(restOfArray, currentSubarray);

    // Создаем новый подмассив, включающий первый элемент
    getAllSubarrays(restOfArray, [...currentSubarray, firstElement]);
  }
  getAllSubarrays(arr);
  console.log(count);

  return result;
}
