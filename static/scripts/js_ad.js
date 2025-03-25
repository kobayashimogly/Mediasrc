function loadJsAdTool(content) {
    content.innerHTML = `
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4">JS広告ツール</h2>
  
    <!-- 新規と追加の選択 -->
    <div class="mb-4">
      <button id="newAd" class="px-4 py-2 bg-blue-500 text-white rounded mr-4">新規</button>
      <button id="addAd" class="px-4 py-2 bg-green-500 text-white rounded">追加</button>
    </div>
  
    <!-- 入力フォーム -->
    <form id="adForm" class="space-y-4 hidden">
      <!-- カテゴリー（新規の場合のみ表示） -->
      <div id="categorySection" class="hidden">
        <label class="block font-bold mb-2">カテゴリー</label>
        <input type="text" id="categoryInput" class="w-full border rounded p-2" placeholder="カテゴリを入力 (例: Pr es)">
      </div>
  
      <!-- 場所の選択 -->
      <div>
        <label class="block font-bold mb-2">場所</label>
        <select id="locationSelect" class="w-full border rounded p-2">
          <option value="#h2-1">SP下部</option>
          <option value="#toc_container">目次上</option>
          <option value="heading">見出し</option>
        </select>
      </div>
  
      <!-- 見出しの場合の追加オプション -->
      <div id="headingOptions" class="hidden">
        <label class="block font-bold mb-2">見出し番号</label>
        <select id="headingNumber" class="w-full border rounded p-2">
          ${[...Array(10).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join("")}
        </select>
      </div>
  
      <!-- ABテストの選択 -->
      <div>
        <label class="block font-bold mb-2">ABテスト</label>
        <select id="abTest" class="w-full border rounded p-2">
          <option value="no">しない</option>
          <option value="yes">する</option>
        </select>
      </div>
  
      <!-- 内容Aと内容B入力（ABテスト用） -->
      <div id="abContentWrapper" class="hidden">
        <label class="block font-bold">内容A</label>
        <textarea id="adContentA" class="w-full border rounded p-2" rows="5" placeholder="Aパターンの内容を入力"></textarea>
        <label class="block font-bold mt-4">内容B</label>
        <textarea id="adContentB" class="w-full border rounded p-2" rows="5" placeholder="Bパターンの内容を入力"></textarea>
      </div>
  
      <!-- 単一の内容入力 -->
      <div id="adContentWrapper">
        <label class="block font-bold">内容</label>
        <textarea id="adContent" class="w-full border rounded p-2" rows="5" placeholder="広告内容を入力"></textarea>
      </div>
  
      <!-- ボタン -->
      <button id="generateCode" type="button" class="px-4 py-2 bg-yellow-500 text-white rounded">作成</button>
    </form>
  
    <!-- 結果 -->
    <textarea id="output" class="w-full border rounded p-4 mt-4 hidden" rows="8" readonly></textarea>
    <button id="copyCode" class="px-4 py-2 bg-yellow-500 text-white rounded mt-2 hidden">コピー</button>
  </div>
    `;
  
    const newAdButton = document.getElementById("newAd");
    const addAdButton = document.getElementById("addAd");
    const adForm = document.getElementById("adForm");
    const categorySection = document.getElementById("categorySection");
    const locationSelect = document.getElementById("locationSelect");
    const headingOptions = document.getElementById("headingOptions");
    const abTest = document.getElementById("abTest");
    const abContentWrapper = document.getElementById("abContentWrapper");
    const adContentWrapper = document.getElementById("adContentWrapper");
    const generateCode = document.getElementById("generateCode");
    const output = document.getElementById("output");
    const copyCode = document.getElementById("copyCode");
  
    newAdButton.addEventListener("click", () => {
      categorySection.classList.remove("hidden");
      adForm.classList.remove("hidden");
    });
  
    addAdButton.addEventListener("click", () => {
      categorySection.classList.add("hidden");
      adForm.classList.remove("hidden");
    });
  
    locationSelect.addEventListener("change", () => {
      if (locationSelect.value === "heading") {
        headingOptions.classList.remove("hidden");
      } else {
        headingOptions.classList.add("hidden");
      }
    });
  
    abTest.addEventListener("change", () => {
      if (abTest.value === "yes") {
        adContentWrapper.classList.add("hidden");
        abContentWrapper.classList.remove("hidden");
      } else {
        adContentWrapper.classList.remove("hidden");
        abContentWrapper.classList.add("hidden");
      }
    });
  
    generateCode.addEventListener("click", () => {
      const location = locationSelect.value === "heading" ? `#h2-${document.getElementById("headingNumber").value}` : locationSelect.value;
      const isABTest = abTest.value === "yes";
      const category = categorySection.classList.contains("hidden")
        ? null
        : document.getElementById("categoryInput").value.trim();
  
      let contentA = "";
      let contentB = "";
  
      if (isABTest) {
        contentA = document.getElementById("adContentA").value.trim();
        contentB = document.getElementById("adContentB").value.trim();
        if (!contentA || !contentB) {
          alert("AパターンとBパターンの内容を入力してください！");
          return;
        }
      } else {
        contentA = document.getElementById("adContent").value.trim();
        if (!contentA) {
          alert("広告内容を入力してください！");
          return;
        }
      }
  
      let generatedCode = "";
  
      if (category) {
        generatedCode = isABTest
          ? `
  else if (${category}.includes(currentArticleId)) {
    const assignedVariant = Math.random() < 0.5 ? 'A' : 'B';
    if (assignedVariant === 'A') {
      $('${location}').before('${contentA}');
    } else {
      $('${location}').before('${contentB}');
    }
  }`
          : `
  else if (${category}.includes(currentArticleId)) {
    $('${location}').before('${contentA}');
  }`;
      } else {
        generatedCode = isABTest
          ? `
    const assignedVariant = Math.random() < 0.5 ? 'A' : 'B';
    if (assignedVariant === 'A') {
      $('${location}').before('${contentA}');
    } else {
      $('${location}').before('${contentB}');
    }`
          : `
  $('${location}').before('${contentA}');
  `;
      }
  
      output.value = generatedCode.trim();
      output.classList.remove("hidden");
      copyCode.classList.remove("hidden");
    });
  
    copyCode.addEventListener("click", () => {
      navigator.clipboard.writeText(output.value).then(() => {
        alert("コードがコピーされました！");
      });
    });
  }
  