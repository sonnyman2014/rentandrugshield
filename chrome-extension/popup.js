const KEYS = ["togTrending","togRugRed","togPcGuard","togRpcLag","togClipboard","togAutoReclaim","soundProfile"];
chrome.storage.local.get(null, (st) => {
  KEYS.forEach((k) => {
    const el = document.getElementById(k);
    if (!el) return;
    if (el.type === "checkbox" && st[k] !== undefined) el.checked = Boolean(st[k]);
    else if (st[k]) el.value = st[k];
    el.onchange = () => chrome.storage.local.set({ [k]: el.type === "checkbox" ? el.checked : el.value });
  });
  const setM = (m) => {
    document.getElementById("mInst").classList.toggle("active", m === "institutional");
    document.getElementById("mMeme").classList.toggle("active", m === "meme");
    chrome.storage.local.set({ uiMode: m });
  };
  if (st.uiMode) setM(st.uiMode);
  document.getElementById("mInst").onclick = () => setM("institutional");
  document.getElementById("mMeme").onclick = () => setM("meme");
  if (st.currentReason) document.getElementById("statusBox").textContent = st.currentReason;
});
document.getElementById("openSite").onclick = () => chrome.tabs.create({ url: "https://rentandrugshield.com/" });
