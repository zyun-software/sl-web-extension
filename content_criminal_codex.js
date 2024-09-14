const weapon = {
  1: {
    3: true,
    4: true,
    5: true,
    6: {
      1: true,
      2: true,
    },
  },
  2: {
    3: {
      2: true,
      3: true,
    },
    4: true,
    6: true,
    8: true,
    10: true,
  },
  4: {
    16: {
      3: true,
    },
  },
  5: {
    3: true,
    4: true,
  },
  8: {
    3: true,
    4: true,
    5: true,
    7: true,
    8: true,
    9: true,
    10: true,
  },
};

const $modalWrapper = document.createElement("div");
document.body.appendChild($modalWrapper);

$modalWrapper.style.display = "none";
$modalWrapper.style.alignItems = "center";
$modalWrapper.style.zIndex = "99999";
$modalWrapper.style.position = "fixed";
$modalWrapper.style.inset = "0";
$modalWrapper.style.fontSize = "16px";
$modalWrapper.style.backgroundColor = "rgba(0, 0, 0, 0.8)";

const $modal = document.createElement("div");
$modalWrapper.appendChild($modal);

$modal.style.margin = "10px auto";
$modal.style.overflow = "auto";
$modal.style.maxHeight = "100vh";
$modal.style.maxWidth = "1400px";
$modal.style.width = "100%";
$modal.style.padding = "10px";
$modal.style.borderRadius = "10px";
$modal.style.background = "white";

const setButtonStyles = ($button) => {
  $button.style.padding = "10px";
  $button.style.borderRadius = "5px";
  $button.style.backgroundColor = "#a0a0ff";
  $button.style.border = "4px solid blue";
  $button.style.fontWeight = "bold";
  $button.style.color = "blue";
  $button.style.cursor = "pointer";
};

const $closeModalButton = document.createElement("button");
$modal.appendChild($closeModalButton);

$closeModalButton.addEventListener("click", () => {
  $modalWrapper.style.display = "none";
});

$closeModalButton.textContent = "Закрити модальне вікно";

$closeModalButton.style.display = "block";
$closeModalButton.style.marginBottom = "10px";
$closeModalButton.style.width = "100%";
setButtonStyles($closeModalButton);

const $modalContent = document.createElement("div");
$modal.appendChild($modalContent);

const $articles = document.createElement("div");
$modal.appendChild($articles);

$articles.style.display = "flex";
$articles.style.marginTop = "10px";

const $articlesInput = document.createElement("input");
$articles.appendChild($articlesInput);

$articlesInput.readOnly = true;

$articlesInput.style.flex = "1";
$articlesInput.style.marginRight = "10px";

const $articlesCopyButton = document.createElement("button");
$articles.appendChild($articlesCopyButton);

$articlesCopyButton.style.cursor = "pointer";

const $totalJailTime = document.createElement("div");
$modal.appendChild($totalJailTime);

const baseText = "Скопіювати статті";
let interval = null;
$articlesCopyButton.addEventListener("click", () => {
  navigator.clipboard
    .writeText($articlesInput.value)
    .then(() => {
      $articlesCopyButton.textContent = "Статті скопійовано";
      $articlesCopyButton.disabled = true;

      clearInterval(interval);
      interval = setInterval(() => {
        $articlesCopyButton.textContent = baseText;
        $articlesCopyButton.disabled = false;
      }, 1000);

      console.log("Текст скопійовано до буфера обміну");
    })
    .catch((err) => {
      console.error("Помилка копіювання: ", err);
    });
});

$articlesCopyButton.textContent = baseText;

const $openModalButton = document.createElement("button");
document.body.appendChild($openModalButton);

$openModalButton.addEventListener("click", () => {
  $modalWrapper.style.display = "flex";
});

$openModalButton.textContent = "Показати обрані статті";

$openModalButton.style.display = "none";
$openModalButton.style.zIndex = "99998";
$openModalButton.style.position = "fixed";
$openModalButton.style.left = "5px";
$openModalButton.style.bottom = "5px";
setButtonStyles($openModalButton);

const selectedArticles = {};

const s = document
  .querySelector(".bbWrapper")
  .textContent.split("Ступінь тяжкості злочину");

Array.from(document.querySelectorAll("*"))
  .filter(
    (element) =>
      element.tagName === "B" &&
      element.textContent.trim().startsWith("Ступінь тяжкості злочину")
  )
  .forEach(($element, index) => {
    const label = document.createElement("label");
    label.style.cursor = "pointer";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.style.marginRight = "5px";
    input.addEventListener("change", () => {
      const item = {};

      const sectionText = "Розділ";
      const $sectionNode = findPreviousNodeWithText($element, sectionText);
      if ($sectionNode) {
        item.section = $sectionNode.sibling.textContent;
        let [str] = item.section.split(".");
        str = str.replace(`${sectionText} `, "");
        item.sectionNum = romanToArabic(str);
        item.inShort = `Р${item.sectionNum}`;
      }

      const articleText = "Стаття";
      const $articleNode = findPreviousNodeWithText($element, articleText);

      const regexArticle = /Стаття \d+\.\s*[^.]+/;
      const matchArticle = s[index].match(regexArticle);
      if (matchArticle || $articleNode) {
        item.article = matchArticle
          ? `${matchArticle[0].trim()}.`
          : $articleNode.sibling.textContent;
        let [str] = item.article.split(".");
        str = str.replace(`${articleText} `, "");
        item.articleNum = parseInt(str);
        item.inShort += ` Cт${item.articleNum}`;
      }

      const regexPart = /Частина \d+\.\s*(.*)/;
      const matchPart = s[index].match(regexPart);

      if (matchPart) {
        const partText = "Частина";
        item.part = matchPart[0].trim();
        let [str] = item.part.split(".");
        str = str.replace(`${partText} `, "");
        item.partNum = parseInt(str);
        item.inShort += ` Ч${item.partNum}`;
      }

      item.minusWeapon = item.minusWeapon = checkNested(
        weapon,
        item.sectionNum,
        item.articleNum,
        item.partNum
      );

      const severityMatch = $element.textContent.match(
        /Ступінь тяжкості злочину - (\d+)/
      );
      const wantedLevelMatch =
        $element.textContent.match(/РІВЕНЬ РОЗШУКУ (\d+)/);

      item.severity = severityMatch ? parseInt(severityMatch[1], 10) : null;
      item.wantedLevel = wantedLevelMatch
        ? parseInt(wantedLevelMatch[1], 10)
        : null;

      item.jailTime = getJailTime(item.severity);
      item.crimeQualification = getCrimeQualification(item.severity);
      item.checkbox = input;

      const isChecked = input.checked;
      if (isChecked) {
        selectedArticles[index] = item;
      } else {
        delete selectedArticles[index];
      }

      draw(selectedArticles);
    });

    label.appendChild(input);
    label.appendChild($element.firstChild.cloneNode(true));

    $element.appendChild(label);

    $element.firstChild.remove();
  });

function checkNested(weapon, sectionNum, articleNum, partNum) {
  if (weapon[sectionNum]?.[articleNum] === true) {
    return true;
  }

  if (weapon[sectionNum]?.[articleNum]?.[partNum] === true) {
    return true;
  }
  return false;
}

function draw(selectedArticles) {
  const indexes = Object.keys(selectedArticles);
  $openModalButton.style.display = indexes.length > 0 ? "block" : "none";

  $modalContent.innerHTML = "";
  indexes.forEach((index) => {
    const el = selectedArticles[index];
    const $div = document.createElement("div");
    $modalContent.appendChild($div);

    $div.style.borderBottom = "1px solid #ccc";
    $div.style.padding = "5px 0";

    const $button = document.createElement("button");
    $div.appendChild($button);

    $button.addEventListener("click", () => {
      delete selectedArticles[index];
      draw(selectedArticles);
      el.checkbox.checked = false;
      if (Object.keys(selectedArticles).length === 0) {
        $modalWrapper.style.display = "none";
      }
    });

    $button.textContent = "🗑️";

    $button.style.marginRight = "5px";
    $button.style.cursor = "pointer";

    const $span = document.createElement("span");
    $div.appendChild($span);

    $span.innerHTML = `<b>${el.inShort}</b> - ${
      el.part || el.article
    } Ступінь тяжкості - <b>${el.crimeQualification}</b>. Рівень розшуку - <b>${
      el.wantedLevel
    }</b>. Термін: <b>${el.jailTime}</b>. ${
      el.minusWeapon
        ? ' <b style="color: tomato">Вилучення ліцензії на зброю</b>'
        : ""
    }`;
  });

  $articlesInput.value = indexes
    .map((index) => selectedArticles[index].inShort)
    .join(", ");

  const totalJailTime = indexes.reduce(
    (sum, index) => sum + selectedArticles[index].jailTime,
    0
  );

  $totalJailTime.innerHTML = `Кількість місяців: <b>${totalJailTime}</b>${
    totalJailTime > 80
      ? '<br><span style="color: tomato">Ви можете видати максимум 80 місяців. Якщо хочете, щоб людина отримала більше, то викликайте прокурора<span>'
      : ""
  }`;
}

function findPreviousNodeWithText(node, pattern, toParrent = true) {
  let sibling = node.previousSibling;
  let index = 0;
  const regex =
    typeof pattern === "string" ? new RegExp(`^(${pattern})`) : pattern;

  while (sibling) {
    if (
      sibling.nodeType === Node.ELEMENT_NODE &&
      sibling.textContent.trim().match(regex)
    ) {
      return { index, sibling };
    }
    sibling = sibling.previousSibling;
    index++;
  }

  const parent = node.parentElement;
  if (toParrent && parent) {
    return findPreviousNodeWithText(parent, pattern);
  }

  return null;
}

const romanToArabicMap = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function romanToArabic(romanNumber) {
  let result = 0;
  let prevValue = 0;

  for (let char of romanNumber) {
    const value = romanToArabicMap[char];

    if (value > prevValue) {
      result += value - 2 * prevValue;
    } else {
      result += value;
    }

    prevValue = value;
  }

  return result;
}

function getCrimeQualification(degree) {
  if (degree <= 4) {
    return "Невелика";
  }

  if (degree >= 5 && degree <= 6) {
    return "Середня";
  }

  if (degree >= 7 && degree <= 10) {
    return "Тяжка";
  }

  return "Особливо тяжка";
}

function getJailTime(degree) {
  return degree * 5;
}
