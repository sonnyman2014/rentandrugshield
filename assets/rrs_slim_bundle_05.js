window.exportInstAuditCsv = window.exportInstAuditCsv || function() {
  var lines = ["index,ata_account,token_symbol,gross_rent_sol,fee_tier,net_payout_sol"];
  lines.push("1,7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,EMPTY-ATA,0.00203928,0.0% FREE,0.00203928");
  var blob = new Blob([lines.join("\n")], {type: "text/csv;charset=utf-8;"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "rent_rug_shield_12layer_audit.csv";
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 400);
};
if (!window.exportDeadBagAuditCsv) window.exportDeadBagAuditCsv = window.exportInstAuditCsv;
