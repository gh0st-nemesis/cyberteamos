let current = 0;
let score = 0;
let security = 100;
let phishingMode = false;
let arcadeMode = true;
let scores = { quiz: 0, phishing: 0, tri: 0, memory: 0, rapid: 0, assoc: 0, vraiFaux: 0, drag: 0, scenario: 0, fps: 0 };
let windowCount = 0;

const allMissions = [
  { titre: "Analyser un mail suspect", desc: "Ouvre le logiciel Mail, identifie l'IP de phishing et signale-la.", type: 'mail', done: false },
  { titre: "Scanner un lien suspect", desc: "Utilise l'outil Scan de lien pour obtenir l'IP cible du lien reçu par mail.", type: 'linkscan', done: false },
  { titre: "Consulter les logs réseau", desc: "Ouvre les logs et repère l'activité anormale.", type: 'logs', done: false },
  { titre: "Scanner le réseau", desc: "Lance un scan réseau via le scanner ou le terminal.", type: 'scanner', done: false },
  { titre: "Bloquer l'IP malveillante", desc: "Utilise le terminal pour bloquer l'IP de phishing.", type: 'terminal', done: false },
  { titre: "Isoler la machine compromise", desc: "Isole la machine 192.168.1.12 via le terminal.", type: 'terminal', done: false },
  { titre: "Changer le mot de passe utilisateur", desc: "Utilise la commande terminal 'passwd utilisateur' pour changer le mot de passe.", type: 'password', done: false },
  { titre: "Déployer un patch de sécurité", desc: "Utilise le terminal pour patcher le système.", type: 'terminal', done: false },
  { titre: "Lancer un scan antivirus", desc: "Ouvre l'antivirus et lance un scan complet.", type: 'antivirus', done: false },
  
];

let missions = allMissions.slice(0, 3);
let missionIndex = 3;

function showMissionsPanel() {
    let html = `<div id='missions-title'>🗂️ Missions</div><ul id='missions-list'>`;
    missions.forEach((m, i) => {
        let action = '';
        if(m.type==='mail') action = `onclick=\"openWindow('mail')\"`;
        if(m.type==='logs') action = `onclick=\"openWindow('logs')\"`;
        if(m.type==='scanner') action = `onclick=\"openWindow('scanner')\"`;
        if(m.type==='terminal') action = `onclick=\"openWindow('terminal')\"`;
        if(m.type==='linkscan') action = `onclick=\"openWindow('linkscan')\"`;
        html += `<li class='mission-item${m.done ? " done" : ""}' style='cursor:pointer;' ${action}>
            <b>${m.titre}</b><br><span>${m.desc}</span>
            <span class='mission-status'>${m.done ? "✅" : "⏳"}</span>
        </li>`;
    });
    html += '</ul>';
    document.getElementById('missions-panel').innerHTML = html;
}

function validateMission(action) {
    if (!missions[0].done && action === 'mail') {
        completeMission(0);
        return;
    }
    if (!missions[1].done && (action === 'scan' || action === 'antivirus')) {
        completeMission(1);
        return;
    }
    if (!missions[2].done && action === 'isoler') {
        completeMission(2);
        return;
    }
}

function completeMission(idx) {
  missions[idx].done = true;
  showMissionNotification('Mission réussie : ' + missions[idx].titre);
  setTimeout(() => {
    missions.splice(idx, 1);
    while (missionIndex < allMissions.length && missions.find(m => m.titre === allMissions[missionIndex].titre)) {
      missionIndex++;
    }
    if (missionIndex < allMissions.length) {
      missions.push({...allMissions[missionIndex]});
      missionIndex++;
    }
    showMissionsPanel();
    
    if (missions.length === 0) {
      document.getElementById('game').innerHTML = `<div style='text-align:center;margin-top:60px;'><h2 style='color:#00e6a8;font-size:2.2rem;'>🎉 Vous avez réussi à sauver HappyGames !</h2><p style='color:#fff;font-size:1.2rem;margin-top:18px;'>Bravo, toutes les missions ont été accomplies.</p><button onclick='location.reload()' style='margin-top:32px;background:#00e6a8;color:#10151e;font-size:1.1rem;padding:10px 32px;border:none;border-radius:8px;cursor:pointer;box-shadow:0 2px 12px #00e6a822;'>Recommencer</button></div>`;
    }
  }, 800);
}





function showScenario() {
    if (arcadeMode) {
        showArcadeMenu();
        return;
    }
    if (current === scenarios.length && !phishingMode) {
        scores.quiz = score;
        document.getElementById('score-quiz').innerText = score;
        arcadeMode = true;
        showArcadeMenu();
        return;
    }
    const gameDiv = document.getElementById('game');
    if (security <= 0) {
        gameDiv.innerHTML = `<h2>💀 Game Over</h2><p>Votre sécurité est tombée à zéro !<br>Score : ${score} / ${scenarios.length}</p>`;
        document.getElementById('score').innerText = '';
        document.getElementById('security-bar').style.width = '0%';
        document.getElementById('restart').style.display = 'inline-block';
        return;
    }
    if (current >= scenarios.length) {
        gameDiv.innerHTML = `<h2>🎉 Bravo !</h2><p>Votre score : ${score} / ${scenarios.length}</p>`;
        document.getElementById('score').innerText = '';
        document.getElementById('restart').style.display = 'inline-block';
        return;
    }
    const s = scenarios[current];
    let html = `<p>${s.question}</p>`;
    s.options.forEach((opt, i) => {
        html += `<button onclick='answer(${i})'>${opt.text}</button><br>`;
    });
    document.getElementById('score').innerText = `Question ${current+1} / ${scenarios.length}`;
    gameDiv.innerHTML = html;
    document.getElementById('security-bar').style.width = security + '%';
}

window.answer = function(idx) {
    const s = scenarios[current];
    const opt = s.options[idx];
    const gameDiv = document.getElementById('game');
    security -= opt.risk;
    if (opt.risk === 0) score++;
    let barColor = security > 60 ? '#00e6a8' : security > 30 ? '#ffb300' : '#e60026';
    document.getElementById('security-bar').style.background = barColor;
    document.getElementById('security-bar').style.width = (security > 0 ? security : 0) + '%';
    if (security <= 0) {
        gameDiv.innerHTML = `<p>${opt.feedback}</p><h2>💀 Game Over</h2><p>Votre sécurité est tombée à zéro !<br>Score : ${score} / ${scenarios.length}</p><button onclick='restartGame()'>Rejouer</button>`;
        document.getElementById('score').innerText = '';
        document.getElementById('restart').style.display = 'none';
        return;
    }
    gameDiv.innerHTML = `<p>${opt.feedback}</p><button onclick='next()'>Suivant</button>`;
};

window.next = function() {
    current++;
    showScenario();
};

window.restartGame = function() {
    showArcadeMenu();
};

document.getElementById('restart').onclick = window.restartGame;

if (!document.getElementById('security-container')) {
    const container = document.createElement('div');
    container.id = 'security-container';
    container.style = 'margin-bottom:0;position:fixed;top:0;left:0;width:100vw;z-index:1000;';
    const bar = document.createElement('div');
    bar.id = 'security-bar';
    bar.style = 'height:8px;background:linear-gradient(90deg,#00e6a8,#00b386,#e60026);width:100vw;border-radius:0;transition:width 0.4s,background 0.4s;box-shadow:0 0 8px #00e6a8aa;';
    container.appendChild(bar);
    document.body.insertBefore(container, document.body.firstChild);
}

const restartBtn = document.getElementById('restart');
if (restartBtn) restartBtn.onclick = window.restartGame;

function startPhishingGame() {
    arcadeMode = false;
    phishingMode = true;
    const emails = [
        { subject: "Votre compte bancaire a été bloqué !", sender: "support@banc0fficial.com", link: "http://banc0fficial.com/verify", phishing: true },
        { subject: "Facture EDF disponible", sender: "service@edf.fr", link: "https://edf.fr/facture", phishing: false },
        { subject: "Mise à jour de sécurité Microsoft", sender: "security@m1crosoft.com", link: "http://m1crosoft.com/update", phishing: true },
        { subject: "Livraison Colissimo", sender: "info@colissimo.fr", link: "https://colissimo.fr/track", phishing: false },
        { subject: "Alerte impôts", sender: "impots@gouv-france.com", link: "http://gouv-france.com/impots", phishing: true }
    ];
    let found = 0, errors = 0;
    let html = `<h2>🕵️ Détecte les emails de phishing !</h2><p>Clique UNIQUEMENT sur les liens suspects (phishing).<br>Attention, chaque erreur baisse ta sécurité !</p><ul id='mail-list' style='text-align:left;'>`;
    emails.forEach((mail, i) => {
        html += `<li style='margin-bottom:12px;'><b>De:</b> ${mail.sender}<br><b>Objet:</b> ${mail.subject}<br><a href='#' onclick='checkPhishing(${i});return false;'>${mail.link}</a></li>`;
    });
    html += '</ul>';
    document.getElementById('game').innerHTML = html;
    document.getElementById('score').innerText = '';
    document.getElementById('security-bar').style.width = security + '%';
    window.checkPhishing = function(idx) {
        const mail = emails[idx];
        if (mail.phishing) {
            found++;
            document.querySelectorAll('#mail-list li')[idx].style.background = '#00e6a833';
            document.querySelectorAll('#mail-list li')[idx].style.textDecoration = 'line-through';
        } else {
            errors++;
            security -= 20;
            document.getElementById('security-bar').style.width = (security > 0 ? security : 0) + '%';
            document.querySelectorAll('#mail-list li')[idx].style.background = '#e6002633';
        }
        if (security <= 0) {
            document.getElementById('game').innerHTML = `<h2>💀 Game Over</h2><p>Ta sécurité est tombée à zéro !</p><button onclick='showArcadeMenu()'>Retour menu</button>`;
            scores.phishing = found;
            document.getElementById('score-phishing').innerText = found;
            phishingMode = false;
            arcadeMode = true;
            return;
        }
        if (found === emails.filter(m => m.phishing).length) {
            document.getElementById('game').innerHTML = `<h2>🎉 Bravo !</h2><p>Tu as détecté tous les emails de phishing !</p><button onclick='showArcadeMenu()'>Retour menu</button>`;
            scores.phishing = found;
            document.getElementById('score-phishing').innerText = found;
            phishingMode = false;
            arcadeMode = true;
        }
    };
}





function makeWindow(winId, title, content) {
    return `
    <div class='window' id='${winId}' style='position:absolute;top:${60+Math.random()*100}px;left:${120+Math.random()*200}px;min-width:320px;min-height:120px;z-index:${100+windowCount};background:#181f2a;border:2px solid #00e6a8;border-radius:10px;box-shadow:0 4px 24px #00e6a822;'>
        <div class='window-titlebar' style='background:#10151e;color:#00e6a8;padding:8px 14px;font-weight:bold;border-radius:8px 8px 0 0;cursor:move;user-select:none;'>
            ${title}
            <span style='float:right;cursor:pointer;color:#e60026;font-weight:normal;' onclick='this.closest(".window").remove()'>✖</span>
        </div>
        <div class='window-content'>${content}</div>
    </div>`;
}

function makeDraggable(winId) {
    const win = document.getElementById(winId);
    const bar = win.querySelector('.window-titlebar');
    let offsetX, offsetY, dragging = false;
    bar.onmousedown = function(e) {
        dragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        document.onmousemove = function(e2) {
            if(dragging) {
                win.style.left = (e2.clientX - offsetX) + 'px';
                win.style.top = (e2.clientY - offsetY) + 'px';
            }
        };
        document.onmouseup = function() {
            dragging = false;
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}

function showDesktop() {
    document.getElementById('score').innerText = '';
    document.getElementById('restart').style.display = 'none';
    document.getElementById('security-bar').style.width = security + '%';
    document.getElementById('game').innerHTML = `
        <style>
        #desktop-icons {
            display: grid;
            grid-template-rows: repeat(4, 1fr);
            grid-auto-flow: column;
            gap: 36px;
            justify-content: flex-start;
            align-items: flex-start;
            padding: 48px 32px 24px 32px;
            min-height: 420px;
        }
        .desktop-icon {
            width: 90px; height: 90px; background: rgba(0,230,168,0.10); border-radius: 18px; box-shadow: 0 2px 12px #00e6a822;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-size: 2.2rem; color: #00e6a8; cursor: pointer; transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
            border: 2px solid transparent; position: relative;
        }
        .desktop-icon:hover {
            background: #00e6a8; color: #181f2a; transform: translateY(-6px) scale(1.07);
            box-shadow: 0 6px 24px #00e6a888;
            border: 2px solid #00e6a8;
        }
        .desktop-icon-label {
            margin-top: 8px; font-size: 1.05rem; color: #fff; text-shadow: 0 2px 8px #10151e99;
            font-weight: 500; letter-spacing: 0.01em; text-align: center;
        }
        </style>
        <div id='desktop-bg'>
            <div id='desktop-icons'>
                <div class='desktop-icon' onclick='openWindow("terminal")'>🖥️<div class='desktop-icon-label'>Terminal</div></div>
                <div class='desktop-icon' onclick='openWindow("mail")'>📧<div class='desktop-icon-label'>Mail</div></div>
                <div class='desktop-icon' onclick='openWindow("antivirus")'>🛡️<div class='desktop-icon-label'>Antivirus</div></div>
                <div class='desktop-icon' onclick='openWindow("logs")'>📜<div class='desktop-icon-label'>Logs</div></div>
                <div class='desktop-icon' onclick='openWindow("scanner")'>🌐<div class='desktop-icon-label'>Scanner</div></div>
                <div class='desktop-icon' onclick='openWindow("docs")'>📂<div class='desktop-icon-label'>Docs/sensi</div></div>
                <div class='desktop-icon' onclick='openWindow("tools")'>🛠️<div class='desktop-icon-label'>Docs/Outils</div></div>
                <div class='desktop-icon' onclick='openWindow("linkscan")'>🔎<div class='desktop-icon-label'>Scan de lien</div></div>
            </div>
            <div id='window-area'></div>
            <div id='missions-panel'></div>
            <div id='taskbar'>
                <button class='taskbar-btn' onclick='openWindow("terminal")'>🖥️ Terminal</button>
                <button class='taskbar-btn' onclick='openWindow("mail")'>📧 Mail</button>
                <button class='taskbar-btn' onclick='openWindow("antivirus")'>🛡️ Antivirus</button>
                <button class='taskbar-btn' onclick='openWindow("logs")'>📜 Logs</button>
                <button class='taskbar-btn' onclick='openWindow("scanner")'>🌐 Scanner</button>
                <button class='taskbar-btn' onclick='openWindow("docs")'>📂 Docs/Sensibilisation</button>
                <button class='taskbar-btn' onclick='openWindow("tools")'>🛠️ Docs/Outils</button>
                <button class='taskbar-btn' onclick='openWindow("linkscan")'>🔎 Scan de lien</button>
            </div>
        </div>
    `;
    showMissionsPanel();
}

window.openWindow = function(app) {
    let area = document.getElementById('window-area');
    let winId = 'win-' + (++windowCount);
    let winHtml = '';
    if(app==="terminal") winHtml = makeWindow(winId, 'Terminal', getTerminalContent(winId));
    else if(app==="mail") winHtml = makeWindow(winId, 'Mail', getMailContent(winId));
    else if(app==="antivirus") winHtml = makeWindow(winId, 'Antivirus', getAntivirusContent(winId));
    else if(app==="logs") winHtml = makeWindow(winId, 'Logs', getLogsContent(winId));
    else if(app==="scanner") winHtml = makeWindow(winId, 'Scanner Réseau', getScannerContent(winId));
    else if(app==="docs") winHtml = makeWindow(winId, 'Docs/Sensibilisation', getDocsContent(winId));
    else if(app==="tools") winHtml = makeWindow(winId, 'Docs/Outils', getToolsContent(winId));
    else if(app==="linkscan") winHtml = makeWindow(winId, 'Scan de lien', getLinkScanContent(winId));
    if(winHtml) {
        area.innerHTML += winHtml;
        makeDraggable(winId);
    }
};

// Ajout d'une fonction centralisée pour la validation des missions via input
window.validateMissionInput = function(type, value, winId) {
    value = value.trim();
    let idx = -1;
    if(type === 'mail') {
        // Exemple : demander l'IP de phishing (fictive)
        if(value === '185.42.56.23') {
            idx = missions.findIndex(m => m.type==='mail' && !m.done);
            if(idx !== -1) completeMission(idx);
            return {ok:true, msg:"IP de phishing validée !"};
        } else {
            return {ok:false, msg:"IP incorrecte. Relisez le mail."};
        }
    }
    if(type === 'logs') {
        if(value === '192.168.1.12') {
            idx = missions.findIndex(m => m.type==='logs' && !m.done);
            if(idx !== -1) completeMission(idx);
            return {ok:true, msg:"IP anormale validée !"};
        } else {
            return {ok:false, msg:"IP incorrecte. Relisez les logs."};
        }
    }
    if(type === 'scanner') {
        if(value === '192.168.1.12') {
            idx = missions.findIndex(m => m.type==='scanner' && !m.done);
            if(idx !== -1) completeMission(idx);
            return {ok:true, msg:"IP suspecte validée !"};
        } else {
            return {ok:false, msg:"IP incorrecte. Relisez le scan."};
        }
    }
    if(type === 'antivirus') {
        if(value.toLowerCase() === 'aucun malware détecté') {
            idx = missions.findIndex(m => m.type==='antivirus' && !m.done);
            if(idx !== -1) completeMission(idx);
            return {ok:true, msg:"Scan antivirus validé !"};
        } else {
            return {ok:false, msg:"Résultat incorrect. Relancez le scan."};
        }
    }
    if(type === 'terminal') {
        // Pour les missions terminal, on valide via la commande exécutée (déjà géré dans submitTerminalCmd)
        return {ok:false, msg:"Validation via la commande terminal."};
    }
    return {ok:false, msg:"Type de mission inconnu."};
};

// Modification de getMailContent pour inclure un input de validation
function getMailContent(winId) {
    return `<div style='padding:0 0 0 0;'>
    <div style='background:#fff; border-radius:10px 10px 0 0; border-bottom:1px solid #eee; padding:18px 24px 10px 24px; display:flex; align-items:center;'>
        <img src='logo.png' alt='Bank Logo' style='height:38px;margin-right:18px;'>
        <span style='font-size:1.25rem;color:#1a1a1a;font-weight:bold;'>Banque Nationale</span>
    </div>
    <div style='background:#f7f7f7; padding:24px 28px; color:#222; font-family:sans-serif; border-radius:0 0 10px 10px;'>
        <div style='font-size:1.1rem; margin-bottom:18px;'>
            <b>Objet :</b> <span style='color:#e60026;'>[Alerte Sécurité] Vérification urgente de votre compte</span><br>
            <b>De :</b> Banque Nationale &lt;support@banque-nat.com&gt;<br>
            <b>À :</b> Vous
        </div>
        <div style='margin-bottom:18px;'>
            Bonjour,<br><br>
            Suite à une activité inhabituelle, nous vous demandons de <b>vérifier vos informations</b> pour éviter la suspension de votre compte.<br>
            <a href='#' style='color:#0074d9;text-decoration:underline;' onclick='alert("⚠️ Ce lien est un piège de phishing ! Ne cliquez jamais sur ce type de lien.");return false;'>Cliquez ici pour vérifier votre compte</a><br>
            <span style='display:inline-block;margin-top:8px;color:#888;font-size:0.98rem;'>Lien à scanner : <span style='background:#181f2a;color:#00e6a8;padding:2px 8px;border-radius:6px;font-family:monospace;'>http://banque-nat.com/verify</span></span><br><br>
            Merci de votre compréhension.<br>
        </div>
        <div style='font-size:0.98rem;color:#888;margin-bottom:10px;'>
            --<br>
            Service Client Banque Nationale<br>
            <span style='font-style:italic;'>support@banque-nat.com</span>
        </div>
        <div style='font-size:0.95rem;color:#b00;margin-top:12px;'>⚠️ Attention : Ceci est un exemple d'email de phishing pour sensibilisation.</div>
        <div style='margin-top:18px;'>
            <b>Action :</b> Recopiez l'IP de phishing détectée dans ce mail (ex : 185.42.56.23) et validez.<br>
            <form onsubmit='return validateMailInput("${winId}")' style='margin-top:10px;'>
                <input id='mail-ip-${winId}' placeholder='IP de phishing...' style='background:#181f2a;color:#00e6a8;border:1px solid #00e6a8;padding:6px 12px;border-radius:6px;font-family:monospace;width:160px;'>
                <button type='submit' style='margin-left:8px;background:#00e6a8;color:#10151e;border:none;padding:6px 18px;border-radius:6px;cursor:pointer;'>Valider mail</button>
            </form>
            <div id='mail-feedback-${winId}' style='margin-top:8px;min-height:18px;'></div>
        </div>
    </div>
    </div>`;
}

window.validateMailInput = function(winId) {
    const val = document.getElementById('mail-ip-' + winId).value;
    const feedback = document.getElementById('mail-feedback-' + winId);
    const res = window.validateMissionInput('mail', val, winId);
    feedback.innerHTML = `<span style='color:${res.ok ? '#00e6a8' : '#e60026'};'>${res.msg}</span>`;
    return false;
};

function getDocsContent(winId) {
    return `<div style='padding:18px 24px; color:#00e6a8; font-family:monospace; max-height:340px; overflow-y:auto;'>
    <h3 style='color:#fff;'>🧠 Sensibilisation à la cybersécurité</h3>
    <ul style='color:#00e6a8; font-size:1.08rem; line-height:1.7;'>
        <li>Ne cliquez jamais sur un lien suspect dans un mail inattendu.</li>
        <li>Vérifiez toujours l'adresse de l'expéditeur et le contenu du mail.</li>
        <li>Utilisez des mots de passe forts et uniques pour chaque service.</li>
        <li>Ne branchez jamais de clé USB inconnue sur votre ordinateur.</li>
        <li>Gardez vos logiciels et antivirus à jour.</li>
        <li>En cas de doute, contactez le service informatique.</li>
        <li>Ne communiquez jamais d'informations sensibles par mail non sollicité.</li>
        <li>Privilégiez l'accès direct aux sites officiels (ne passez pas par les liens reçus).</li>
    </ul>
    <h4 style='color:#fff;margin-top:18px;'>Pourquoi se protéger ?</h4>
    <p style='color:#00e6a8;'>Les cyberattaques sont de plus en plus fréquentes et sophistiquées. Un simple clic peut compromettre toute une organisation. Restez vigilant !</p>
    </div>`;
}

function getMailContent(winId) {
    return `<div style='padding:0 0 0 0;'>
    <div style='background:#fff; border-radius:10px 10px 0 0; border-bottom:1px solid #eee; padding:18px 24px 10px 24px; display:flex; align-items:center;'>
        <img src='logo.png' alt='Bank Logo' style='height:38px;margin-right:18px;'>
        <span style='font-size:1.25rem;color:#1a1a1a;font-weight:bold;'>Banque Nationale</span>
    </div>
    <div style='background:#f7f7f7; padding:24px 28px; color:#222; font-family:sans-serif; border-radius:0 0 10px 10px;'>
        <div style='font-size:1.1rem; margin-bottom:18px;'>
            <b>Objet :</b> <span style='color:#e60026;'>[Alerte Sécurité] Vérification urgente de votre compte</span><br>
            <b>De :</b> Banque Nationale &lt;support@banque-nat.com&gt;<br>
            <b>À :</b> Vous
        </div>
        <div style='margin-bottom:18px;'>
            Bonjour,<br><br>
            Suite à une activité inhabituelle, nous vous demandons de <b>vérifier vos informations</b> pour éviter la suspension de votre compte.<br>
            <a href='#' style='color:#0074d9;text-decoration:underline;' onclick='alert("⚠️ Ce lien est un piège de phishing ! Ne cliquez jamais sur ce type de lien.");return false;'>Cliquez ici pour vérifier votre compte</a><br>
            <span style='display:inline-block;margin-top:8px;color:#888;font-size:0.98rem;'>Lien à scanner : <span style='background:#181f2a;color:#00e6a8;padding:2px 8px;border-radius:6px;font-family:monospace;'>http://banque-nat.com/verify</span></span><br><br>
            Merci de votre compréhension.<br>
        </div>
        <div style='font-size:0.98rem;color:#888;margin-bottom:10px;'>
            --<br>
            Service Client Banque Nationale<br>
            <span style='font-style:italic;'>support@banque-nat.com</span>
        </div>
        <div style='font-size:0.95rem;color:#b00;margin-top:12px;'>⚠️ Attention : Ceci est un exemple d'email de phishing pour sensibilisation.</div>
        <div style='margin-top:18px;'>
            <b>Action :</b> Recopiez l'IP de phishing détectée dans ce mail (ex : 185.42.56.23) et validez.<br>
            <form onsubmit='return validateMailInput("${winId}")' style='margin-top:10px;'>
                <input id='mail-ip-${winId}' placeholder='IP de phishing...' style='background:#181f2a;color:#00e6a8;border:1px solid #00e6a8;padding:6px 12px;border-radius:6px;font-family:monospace;width:160px;'>
                <button type='submit' style='margin-left:8px;background:#00e6a8;color:#10151e;border:none;padding:6px 18px;border-radius:6px;cursor:pointer;'>Valider mail</button>
            </form>
            <div id='mail-feedback-${winId}' style='margin-top:8px;min-height:18px;'></div>
        </div>
    </div>
    </div>`;
}

function getLogsContent(winId) {
    return `<div style='padding:18px;color:#00e6a8;font-family:monospace;max-height:220px;overflow-y:auto;'>
<b>Logs réseau :</b><br>
[10:12:01] 192.168.1.12 : Connexion sortante vers IP inconnue<br>
[10:12:05] 192.168.1.12 : Téléchargement fichier suspect.exe<br>
[10:12:10] 192.168.1.15 : Authentification réussie<br>
[10:12:15] 192.168.1.12 : Exécution suspect.exe<br>
[10:12:20] 192.168.1.12 : Tentative d'accès admin<br>
<br>
<b>Action :</b> Recopiez l'IP anormale détectée ci-dessous et cliquez sur "Valider logs".<br>
<form onsubmit='return validateLogsInput("${winId}")' style='margin-top:10px;'>
  <input id='logs-ip-${winId}' placeholder='IP anormale...' style='background:#181f2a;color:#00e6a8;border:1px solid #00e6a8;padding:6px 12px;border-radius:6px;font-family:monospace;width:160px;'>
  <button type='submit' style='background:#00e6a8;color:#10151e;border:none;padding:6px 18px;border-radius:6px;margin-left:8px;cursor:pointer;'>Valider logs</button>
</form>
<div id='logs-feedback-${winId}' style='margin-top:8px;min-height:18px;'></div>
</div>`;
}

window.validateLogsInput = function(winId) {
    const val = document.getElementById('logs-ip-' + winId).value.trim();
    const feedback = document.getElementById('logs-feedback-' + winId);
    if(val === '192.168.1.12') {
        feedback.innerHTML = `<span style='color:#00e6a8;'>IP anormale validée !</span>`;
        const idx = missions.findIndex(m => m.type==='logs' && !m.done);
        if(idx !== -1) completeMission(idx);
    } else {
        feedback.innerHTML = `<span style='color:#e60026;'>IP incorrecte. Relisez les logs.</span>`;
    }
    return false;
};

function getScannerContent(winId) {
    return `<div style='padding:18px;color:#00e6a8;font-family:monospace;'>Scanner réseau :<br>192.168.1.12 <span style='color:#e60026;'>[SUSPICIEUX]</span><br>192.168.1.15 [OK]<br><br>
<b>Action :</b> Recopiez l'IP suspecte détectée ci-dessous et cliquez sur "Valider scan".<br>
<form onsubmit='return validateScannerInput("${winId}")' style='margin-top:10px;'>
  <input id='scanner-ip-${winId}' placeholder='IP suspecte...' style='background:#181f2a;color:#00e6a8;border:1px solid #00e6a8;padding:6px 12px;border-radius:6px;font-family:monospace;width:160px;'>
  <button type='submit' style='background:#00e6a8;color:#10151e;border:none;padding:6px 18px;border-radius:6px;margin-left:8px;cursor:pointer;'>Valider scan</button>
</form>
<div id='scanner-feedback-${winId}' style='margin-top:8px;min-height:18px;'></div>
</div>`;
}

window.validateScannerInput = function(winId) {
    const val = document.getElementById('scanner-ip-' + winId).value.trim();
    const feedback = document.getElementById('scanner-feedback-' + winId);
    if(val === '192.168.1.12') {
        feedback.innerHTML = `<span style='color:#00e6a8;'>IP suspecte validée !</span>`;
        const idx = missions.findIndex(m => m.type==='scanner' && !m.done);
        if(idx !== -1) completeMission(idx);
    } else {
        feedback.innerHTML = `<span style='color:#e60026;'>IP incorrecte. Relisez le scan.</span>`;
    }
    return false;
};

window.submitTerminalCmd = function(e, winId) {
    e.preventDefault();
    let body = document.getElementById('terminal-body-'+winId);
    let input = document.getElementById('terminal-input-'+winId);
    let cmd = input.value.trim();
    input.value = '';
    body.innerHTML += `<br>&gt; <span style='color:#fff;'>${cmd}</span>`;
    if(cmd==="help"){
        body.innerHTML += `<br>Commandes : help, scan, logs, analyse, isoler, patch, mail, antivirus, block <ip>, passwd <utilisateur>, clear`;
    } else if(cmd==="scan"){
        body.innerHTML += `<br>Scan réseau en cours...<br>192.168.1.12 [SUSPICIEUX]<br>192.168.1.15 [OK]`;
        const idx = missions.findIndex(m => m.type==='scanner' && !m.done);
        if(idx !== -1) { completeMission(idx); body.innerHTML += `<br><span style='color:#00e6a8;'>Mission scan validée !</span>`; }
    } else if(cmd==="logs"){
        body.innerHTML += `<br>Ouverture des logs...`;
        openWindow('logs');
    } else if(cmd==="analyse"){
        body.innerHTML += `<br>Analyse des fichiers suspects...<br>Malware détecté sur 192.168.1.12 !`;
    } else if(cmd.startsWith("block ")){
        let ip = cmd.split(" ")[1];
        if(ip === '192.168.1.12') {
            body.innerHTML += `<br>IP 192.168.1.12 bloquée.`;
            const idx = missions.findIndex(m => m.titre.includes('Bloquer') && !m.done);
            if(idx !== -1) { completeMission(idx); body.innerHTML += `<br><span style='#00e6a8;'>Mission blocage validée !</span>`; }
        } else {
            body.innerHTML += `<br>IP inconnue ou non malveillante.`;
        }
    } else if(cmd==="isoler"){
        body.innerHTML += `<br>Machine 192.168.1.12 isolée du réseau.`;
        const idx = missions.findIndex(m => m.titre.includes('Isoler') && !m.done);
        if(idx !== -1) { completeMission(idx); body.innerHTML += `<br><span style='color:#00e6a8;'>Mission isolation validée !</span>`; }
    } else if(cmd.startsWith("passwd ")){
        let user = cmd.split(" ")[1];
        if(user && user.toLowerCase() === 'utilisateur') {
            body.innerHTML += `<br>Mot de passe changé pour l'utilisateur.`;
            const idx = missions.findIndex(m => m.type==='password' && !m.done);
            if(idx !== -1) { completeMission(idx); body.innerHTML += `<br><span style='color:#00e6a8;'>Mission mot de passe validée !</span>`; }
        } else {
            body.innerHTML += `<br>Syntaxe : passwd utilisateur`;
        }
    } else if(cmd==="patch"){
        body.innerHTML += `<br>Déploiement des correctifs sur le réseau...`;
        const idx = missions.findIndex(m => m.titre.includes('patch') && !m.done);
        if(idx !== -1) { completeMission(idx); body.innerHTML += `<br><span style='#00e6a8;'>Mission patch validée !</span>`; }
    } else if(cmd==="mail"){
        openWindow('mail');
        body.innerHTML += `<br>Ouverture du logiciel mail...`;
    } else if(cmd==="antivirus"){
        openWindow('antivirus');
        body.innerHTML += `<br>Ouverture de l'antivirus...`;
    } else if(cmd==="clear"){
        body.innerHTML = '';
    } else {
        body.innerHTML += `<br>Commande inconnue. Tapez help.`;
    }
    body.scrollTop = body.scrollHeight;
    return false;
};

window.addEventListener('DOMContentLoaded', function() {
    showDesktop();
});

function getAntivirusContent(winId) {
    return `<div style='padding:18px;color:#00e6a8;font-family:monospace;'>
<b>Antivirus professionnel</b><br><br>
Statut : <span style='color:#00e6a8;'>Aucun malware détecté</span><br>
Dernier scan : il y a 2h<br><br>
<form onsubmit='return runAntivirusScan("${winId}")' style='margin-top:10px;'>
  <button type='submit' style='background:#00e6a8;color:#10151e;border:none;padding:6px 18px;border-radius:6px;cursor:pointer;'>Lancer un scan</button>
</form>
<div id='antivirus-feedback-${winId}' style='margin-top:8px;min-height:18px;'></div>
</div>`;
}

window.runAntivirusScan = function(winId) {
    const feedback = document.getElementById('antivirus-feedback-' + winId);
    feedback.innerHTML = `<span style='color:#00e6a8;'>Scan terminé : aucun malware détecté.</span>`;
    const idx = typeof missions !== 'undefined' ? missions.findIndex(m => m.type==='antivirus' && !m.done) : -1;
    if(idx !== -1) {
        if (typeof completeMission === 'function') completeMission(idx);
        if (feedback) feedback.innerHTML += `<br><span style='color:#00e6a8;'>Mission antivirus validée !</span>`;
    }
    return false;
};

function getTerminalContent(winId) {
    return `<div id='terminal-body-${winId}' style='height:180px;overflow-y:auto;background:#10151e;padding:12px;font-family:monospace;color:#00e6a8;font-size:1.1rem;'></div>
        <form onsubmit='return submitTerminalCmd(event,"${winId}")' style='display:flex;border-top:1px solid #232c3b;'>
            <span style='color:#00e6a8;font-family:monospace;'>&gt;</span>
            <input id='terminal-input-${winId}' autocomplete='off' style='flex:1;background:#181f2a;color:#00e6a8;border:none;padding:8px;font-family:monospace;font-size:1.1rem;' />
        </form>
        <div style='color:#00e6a8;font-size:0.98rem;margin-top:8px;'>Astuce : Tapez <b>passwd utilisateur</b> pour changer le mot de passe !</div>`;
}

function showMissionNotification(msg) {
  let notif = document.createElement('div');
  notif.className = 'mission-notif';
  notif.innerText = msg;
  notif.style = 'position:fixed;top:30px;right:30px;background:#10151e;color:#00e6a8;padding:18px 32px;border-radius:12px;font-size:1.2rem;box-shadow:0 4px 24px #00e6a888;z-index:9999;opacity:0;transition:opacity 0.4s;';
  document.body.appendChild(notif);
  setTimeout(()=>{ notif.style.opacity = 1; }, 10);
  setTimeout(()=>{ notif.style.opacity = 0; setTimeout(()=>notif.remove(), 400); }, 2200);
}

let musicPlayer;
function playBackgroundMusic() {
    if (musicPlayer) return;
    musicPlayer = document.createElement('audio');
    musicPlayer.src = 'ambiance.mp3';
    musicPlayer.loop = true;
    musicPlayer.autoplay = true;
    musicPlayer.volume = 0.3;
    musicPlayer.style = 'display:none;';
    document.body.appendChild(musicPlayer);
    musicPlayer.play();
}
function stopBackgroundMusic() {
    if (musicPlayer) {
        musicPlayer.pause();
        musicPlayer.remove();
        musicPlayer = null;
    }
}

window.enableMusicAfterInteraction = function() {
    if (!musicPlayer) playBackgroundMusic();
    window.removeEventListener('click', window.enableMusicAfterInteraction);
    window.removeEventListener('keydown', window.enableMusicAfterInteraction);
};
window.addEventListener('click', window.enableMusicAfterInteraction);
window.addEventListener('keydown', window.enableMusicAfterInteraction);

// Ajout de l'icône Scan de lien sur le bureau et la barre des tâches
// (à placer dans showDesktop, après les autres icônes)
// Ajout dans #desktop-icons :
// <div class='desktop-icon' onclick='openWindow("linkscan")'>🔎<div class='desktop-icon-label'>Scan de lien</div></div>
// Ajout dans #taskbar :
// <button class='taskbar-btn' onclick='openWindow("linkscan")'>🔎 Scan de lien</button>

// Ajout de la fenêtre Scan de lien
function getLinkScanContent(winId) {
    return `<div style='padding:18px;color:#00e6a8;font-family:monospace;'>
<b>Scan de lien suspect</b><br><br>
Collez ici un lien suspect reçu par mail pour obtenir l'IP cible.<br>
<form onsubmit='return validateLinkScanInput("${winId}")' style='margin-top:10px;'>
  <input id='linkscan-url-${winId}' placeholder='Collez le lien ici...' style='background:#181f2a;color:#00e6a8;border:1px solid #00e6a8;padding:6px 12px;border-radius:6px;font-family:monospace;width:260px;'>
  <button type='submit' style='background:#00e6a8;color:#10151e;border:none;padding:6px 18px;border-radius:6px;margin-left:8px;cursor:pointer;'>Analyser</button>
</form>
<div id='linkscan-feedback-${winId}' style='margin-top:12px;min-height:18px;'></div>
</div>`;
}

window.validateLinkScanInput = function(winId) {
    const val = document.getElementById('linkscan-url-' + winId).value.trim();
    const feedback = document.getElementById('linkscan-feedback-' + winId);
    // Simule la détection d'une IP de phishing si le lien contient "banque-nat.com"
    if(val && (val.includes('banque-nat.com') || val.includes('phishing'))) {
        feedback.innerHTML = `<span style='color:#00e6a8;'>IP détectée : <b>185.42.56.23</b><br>Utilisez cette IP pour valider la mission dans le Mail.</span>`;
        // Validation de la mission scan de lien
        const idx = missions.findIndex(m => m.type==='linkscan' && !m.done);
        if(idx !== -1) completeMission(idx);
    } else if(val) {
        feedback.innerHTML = `<span style='color:#e60026;'>Aucune menace détectée pour ce lien.</span>`;
    } else {
        feedback.innerHTML = '';
    }
    return false;
};

// Ajout du support dans openWindow
const oldOpenWindow = window.openWindow;
window.openWindow = function(app) {
    let area = document.getElementById('window-area');
    let winId = 'win-' + (++windowCount);
    let winHtml = '';
    if(app==="linkscan") winHtml = makeWindow(winId, 'Scan de lien', getLinkScanContent(winId));
    else oldOpenWindow(app); // Appelle l'ancienne fonction pour les autres apps
    if(winHtml) {
        area.innerHTML += winHtml;
        makeDraggable(winId);
    }
};

// --- Compléter Docs/Outils avec commandes terminal et explications ---
function getToolsContent(winId) {
    return `<div style='padding:18px 24px; color:#00e6a8; font-family:monospace; max-height:340px; overflow-y:auto;'>
    <h3 style='color:#fff;'>🛠️ Outils & Commandes Terminal</h3>
    <ul style='color:#00e6a8; font-size:1.08rem; line-height:1.7;'>
        <li><b>help</b> : Affiche la liste des commandes disponibles</li>
        <li><b>scan</b> : Scanner le réseau pour détecter les machines suspectes</li>
        <li><b>logs</b> : Ouvre les logs réseau</li>
        <li><b>analyse</b> : Analyse les fichiers suspects détectés</li>
        <li><b>isoler</b> : Isole une machine compromise du réseau</li>
        <li><b>patch</b> : Déploie un correctif de sécurité</li>
        <li><b>mail</b> : Ouvre le logiciel de messagerie</li>
        <li><b>antivirus</b> : Ouvre l'antivirus</li>
        <li><b>block &lt;ip&gt;</b> : Bloque une adresse IP précise</li>
        <li><b>clear</b> : Efface l'écran du terminal</li>
    </ul>
    <h4 style='color:#fff;margin-top:18px;'>Logiciels disponibles</h4>
    <ul style='color:#00e6a8; font-size:1.08rem; line-height:1.7;'>
        <li>🖥️ <b>Terminal</b> : Exécutez des commandes pour gérer la sécurité</li>
        <li>📧 <b>Mail</b> : Analysez les emails suspects</li>
        <li>🛡️ <b>Antivirus</b> : Lancez des scans antivirus</li>
        <li>📜 <b>Logs</b> : Consultez les journaux réseau</li>
        <li>🌐 <b>Scanner</b> : Scannez le réseau pour détecter des anomalies</li>
        <li>🔎 <b>Scan de lien</b> : Analysez un lien suspect pour obtenir l'IP cible</li>
    </ul>
    </div>`;
}
