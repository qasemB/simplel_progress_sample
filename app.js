const result = document.getElementById("result");
const fileInput = document.getElementById("fileInput");
const selectedFileDiv = document.getElementById("selectedFileDiv");
const uploadBtn = document.getElementById("uploadBtn");
const cancelBtn = document.getElementById("cancelBtn");
const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

let selectedFile = null;
let uploadController = null; // : AbortController

// انتخاب فایل
fileInput.addEventListener("change", function (e) {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    selectedFileDiv.textContent = `فایل انتخاب شده: ${selectedFile.name}`;
    selectedFileDiv.style.display = "block";
    uploadBtn.disabled = false;
    hideResult();
  }
});

// آپلود فایل
uploadBtn.addEventListener("click", async function () {
  if (!selectedFile) return;

  // شروع آپلود
  progressContainer.style.display = "block";
  uploadBtn.disabled = true;
  cancelBtn.style.display = "inline-block";
  progressText.textContent = "در حال آپلود...";
  hideResult();

  // ایجاد AbortController برای لغو
  uploadController = new AbortController();

  try {
    await uploadWithProgress();
    showResult("فایل با موفقیت آپلود شد!", "success");
  } catch (error) {
    if (error.name !== "AbortError") {
      showResult("خطا در آپلود: " + error.message, "error");
    }
  } finally {
    uploadBtn.disabled = false;
    cancelBtn.style.display = "none";
    uploadController = null;
  }
});

// لغو آپلود
cancelBtn.addEventListener("click", function () {
  if (uploadController) {
    uploadController.abort();
    showResult("آپلود لغو شد", "error");
    progressFill.style.width = "0%";
    progressText.textContent = "لغو شد";
  }
});

// تابع آپلود با پراگرس بار XMLHttpRequest
// function uploadWithProgress() {
//   return new Promise((resolve, reject) => {
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     const xhr = new XMLHttpRequest();

//     // نمایش پیشرفت آپلود
//     xhr.upload.addEventListener("progress", function (e) {
//       if (e.lengthComputable) {
//         const percentage = Math.round((e.loaded / e.total) * 100);
//         progressFill.style.width = percentage + "%";
//         progressText.textContent = `آپلود شده: ${percentage}%`;
//       }
//     });

//     xhr.addEventListener("load", function () {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         progressText.textContent = "آپلود کامل شد!";
//         resolve();
//       } else {
//         reject(new Error(`خطای HTTP: ${xhr.status}`));
//       }
//     });

//     xhr.addEventListener("error", function () {
//       reject(new Error("خطا در شبکه"));
//     });

//     xhr.addEventListener("abort", function () {
//       reject(new Error("آپلود لغو شد"));
//     });

//     // اتصال به AbortController
//     uploadController.signal.addEventListener("abort", () => {
//       xhr.abort();
//     });

//     xhr.open("POST", "https://jsonplaceholder.typicode.com/posts");
//     xhr.send(formData);
//   });
// }

// تابع آپلود با پراگرس بار Axios
async function uploadWithProgress() {
  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    await axios.post("https://jsonplaceholder.typicode.com/posts", formData, {
      signal: uploadController.signal, // 👉 برای لغو کردن
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.event.lengthComputable) {
          const percentage = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          progressFill.style.width = percentage + "%";
          progressText.textContent = `آپلود شده: ${percentage}%`;
        }
      },
    });

    progressText.textContent = "آپلود کامل شد!";
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new Error("آپلود لغو شد");
    } else if (error.name === "CanceledError") {
      // ورژن‌های جدید axios
      throw new Error("آپلود لغو شد");
    } else {
      throw new Error("خطا: " + error.message);
    }
  }
}

function showResult(message, type) {
  result.textContent = message;
  result.className = `result ${type}`;
  result.style.display = "block";
}

function hideResult() {
  result.style.display = "none";
}
