package com.rentandrugshield.mobile;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {
    private static final String VIRTUAL_HOST = "appassets.androidplatform.net";
    private static final String ENTRY_URL = "https://appassets.androidplatform.net/index.html";
    private static final String PREF_AUTH = "rrs_mwa_v2_auth_store";
    private static final String PREF_SETTINGS = "rrs_v6_settings_store";
    private static final int REQ_CAMERA_PERM = 6001;

    private WebView webView;
    private PermissionRequest pendingWebPermRequest;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#020408"));

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " SolanaRentRugShieldMobile/6.0.0 MWA/2.0 Capacitor/6");

        webView.addJavascriptInterface(new AndroidShieldBridge(this), "AndroidShield");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                Uri origin = request.getOrigin();
                if (origin != null && VIRTUAL_HOST.equalsIgnoreCase(origin.getHost())) {
                    if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        request.grant(request.getResources());
                    } else {
                        pendingWebPermRequest = request;
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAMERA_PERM);
                    }
                    return;
                }
                request.deny();
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (u != null && VIRTUAL_HOST.equalsIgnoreCase(u.getHost())) {
                    String path = u.getPath();
                    if (path == null || path.isEmpty() || "/".equals(path)) {
                        path = "/index.html";
                    }
                    String assetPath = "www" + path;
                    try {
                        InputStream is = getAssets().open(assetPath);
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        headers.put("Cache-Control", "no-cache");
                        return new WebResourceResponse(guessMime(assetPath), "UTF-8", 200, "OK", headers, is);
                    } catch (IOException ignored) {
                        return null;
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null) return false;
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.US) : "";
                String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.US) : "";

                if ("solana-wallet".equals(scheme) || "solana".equals(scheme)
                        || "phantom".equals(scheme) || "solflare".equals(scheme) || "backpack".equals(scheme)) {
                    launchExternalWallet(uri);
                    return true;
                }
                if (VIRTUAL_HOST.equals(host)) {
                    return false;
                }
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    launchExternalBrowser(uri);
                    return true;
                }
                return true;
            }
        });

        setContentView(webView);
        loadInitialRoute(getIntent());
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_CAMERA_PERM && pendingWebPermRequest != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingWebPermRequest.grant(pendingWebPermRequest.getResources());
            } else {
                pendingWebPermRequest.deny();
            }
            pendingWebPermRequest = null;
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        loadInitialRoute(intent);
    }

    private void loadInitialRoute(Intent intent) {
        if (intent != null) {
            String action = intent.getAction();
            if (Intent.ACTION_SEND.equals(action)) {
                String shared = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (shared != null && !shared.trim().isEmpty()) {
                    String enc = URLEncoder.encode(shared.trim(), StandardCharsets.UTF_8);
                    webView.loadUrl(ENTRY_URL + "?tab=scanner&share_text=" + enc);
                    return;
                }
            } else if (Intent.ACTION_VIEW.equals(action) && intent.getData() != null) {
                String q = intent.getData().getEncodedQuery();
                if (q != null && !q.isEmpty()) {
                    webView.loadUrl(ENTRY_URL + "?" + q);
                    return;
                }
            }
        }
        webView.loadUrl(ENTRY_URL);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    private void launchExternalWallet(Uri uri) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, uri);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            launchExternalBrowser(Uri.parse("https://phantom.app/download"));
        }
    }

    private void launchExternalBrowser(Uri uri) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, uri);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            startActivity(i);
        } catch (Exception ignored) {
        }
    }

    private static String guessMime(String p) {
        String l = p.toLowerCase(Locale.US);
        if (l.endsWith(".html")) return "text/html";
        if (l.endsWith(".js")) return "application/javascript";
        if (l.endsWith(".json") || l.endsWith(".webmanifest")) return "application/json";
        if (l.endsWith(".css")) return "text/css";
        if (l.endsWith(".png")) return "image/png";
        if (l.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    public static final class AndroidShieldBridge {
        private final Context ctx;

        AndroidShieldBridge(Context ctx) {
            this.ctx = ctx.getApplicationContext();
        }

        @JavascriptInterface
        public String getShellVersion() {
            return "6.0.0";
        }

        @JavascriptInterface
        public String getMwaVersion() {
            return "2.0";
        }

        @JavascriptInterface
        public String getSupportedWallets() {
            return "seeker,phantom,solflare,backpack";
        }

        @JavascriptInterface
        public String getQuarantinedFrozenAtas() {
            return "[\"5sEb9m4XP3mXJSsv8GEeck62Z6PY8TfAhmngZrpgNU9Q\","
                    + "\"CsLX8FSsWc8uNfMBUB9PhwcsZBaLstoYpiUi9SDdkDLg\","
                    + "\"DGnsyzo5cbQZMpXEwSbESBnSrdjroj7DhpcAPbfQaUft\","
                    + "\"FRCeYgC1PR7kTKhgk8Peq7WE8Rz6E7cEXnhB77DT5G8F\"]";
        }

        @JavascriptInterface
        public void saveAuthCache(String json) {
            SharedPreferences sp = ctx.getSharedPreferences(PREF_AUTH, Context.MODE_PRIVATE);
            sp.edit().putString("session", json == null ? "" : json).apply();
        }

        @JavascriptInterface
        public String loadAuthCache() {
            SharedPreferences sp = ctx.getSharedPreferences(PREF_AUTH, Context.MODE_PRIVATE);
            return sp.getString("session", "");
        }

        @JavascriptInterface
        public void clearAuthCache() {
            SharedPreferences sp = ctx.getSharedPreferences(PREF_AUTH, Context.MODE_PRIVATE);
            sp.edit().remove("session").apply();
        }

        @JavascriptInterface
        public void saveSettingsJson(String json) {
            SharedPreferences sp = ctx.getSharedPreferences(PREF_SETTINGS, Context.MODE_PRIVATE);
            sp.edit().putString("settings_v6", json == null ? "" : json).apply();
        }

        @JavascriptInterface
        public String loadSettingsJson() {
            SharedPreferences sp = ctx.getSharedPreferences(PREF_SETTINGS, Context.MODE_PRIVATE);
            return sp.getString("settings_v6", "");
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            try {
                Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator()) return;
                int ms = Math.max(8, Math.min(120, durationMs));
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(ms);
                }
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public String readClipboardText() {
            try {
                ClipboardManager cm = (ClipboardManager) ctx.getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null && cm.hasPrimaryClip()) {
                    ClipData cd = cm.getPrimaryClip();
                    if (cd != null && cd.getItemCount() > 0 && cd.getItemAt(0).getText() != null) {
                        return cd.getItemAt(0).getText().toString();
                    }
                }
            } catch (Exception ignored) {
            }
            return "";
        }
    }
}
