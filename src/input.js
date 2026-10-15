export const keys = {};
export const justPressed = {};

export const touchState = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false
};

let lastSentInput = { left: false, right: false, jump: false };
let lastInputSentTime = 0;

export function initInput(onReset, onEmote, onToggleFs) {
  window.addEventListener('keydown', (e) => {
    if (document.activeElement === document.getElementById('joinCodeInput')) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!keys[e.code]) {
      justPressed[e.code] = true;
    }
    keys[e.code] = true;

    if (e.code === 'KeyR' && onReset) onReset();
    if (e.code === 'KeyF' && onToggleFs) onToggleFs();
    if (e.code === 'Digit1' && onEmote) onEmote('JUMP! ⬆️');
    if (e.code === 'Digit2' && onEmote) onEmote('PUSH! 💪');
    if (e.code === 'Digit3' && onEmote) onEmote('WAIT! ✋');
    if (e.code === 'Digit4' && onEmote) onEmote('NICE! 🎉');
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  function bindTouch(id, prop) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = (e) => {
      e.preventDefault();
      if (prop === 'jump' && !touchState.jump) touchState.jumpPressed = true;
      touchState[prop] = true;
    };
    const end = (e) => {
      e.preventDefault();
      touchState[prop] = false;
    };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
  }

  bindTouch('touchLeft', 'left');
  bindTouch('touchRight', 'right');
  bindTouch('touchJump', 'jump');
}

export function getPlayerInputs(netMode, remoteInput, sendNetworkInput, isConnected) {
  if (netMode === 'local') {
    const p1 = {
      left: !!keys['KeyA'] || touchState.left,
      right: !!keys['KeyD'] || touchState.right,
      jump: !!keys['KeyW'] || !!keys['Space'] || touchState.jump,
      jumpPressed: !!justPressed['KeyW'] || !!justPressed['Space'] || touchState.jumpPressed
    };
    const p2 = {
      left: !!keys['ArrowLeft'],
      right: !!keys['ArrowRight'],
      jump: !!keys['ArrowUp'],
      jumpPressed: !!justPressed['ArrowUp']
    };
    return [p1, p2];
  } else if (netMode === 'host') {
    const p1 = {
      left: !!keys['KeyA'] || !!keys['ArrowLeft'] || touchState.left,
      right: !!keys['KeyD'] || !!keys['ArrowRight'] || touchState.right,
      jump: !!keys['KeyW'] || !!keys['ArrowUp'] || !!keys['Space'] || touchState.jump,
      jumpPressed: !!justPressed['KeyW'] || !!justPressed['ArrowUp'] || !!justPressed['Space'] || touchState.jumpPressed
    };
    const p2 = {
      left: remoteInput.left,
      right: remoteInput.right,
      jump: remoteInput.jump,
      jumpPressed: remoteInput.jumpPressed
    };
    remoteInput.jumpPressed = false;
    return [p1, p2];
  } else {
    // Client sends input to host
    const myInput = {
      type: 'input',
      left: !!keys['KeyA'] || !!keys['ArrowLeft'] || touchState.left,
      right: !!keys['KeyD'] || !!keys['ArrowRight'] || touchState.right,
      jump: !!keys['KeyW'] || !!keys['ArrowUp'] || !!keys['Space'] || touchState.jump,
      jumpPressed: !!justPressed['KeyW'] || !!justPressed['ArrowUp'] || !!justPressed['Space'] || touchState.jumpPressed
    };

    // Client sends input to host immediately on keydown/change or at 30Hz heartbeat
    const now = performance.now();
    const hasChanged = myInput.left !== lastSentInput.left ||
                       myInput.right !== lastSentInput.right ||
                       myInput.jump !== lastSentInput.jump ||
                       myInput.jumpPressed;

    if (isConnected() && (hasChanged || (now - lastInputSentTime > 33))) {
      sendNetworkInput(myInput);
      lastSentInput.left = myInput.left;
      lastSentInput.right = myInput.right;
      lastSentInput.jump = myInput.jump;
      lastInputSentTime = now;
    }

    return [
      { left: false, right: false, jump: false, jumpPressed: false },
      myInput
    ];
  }
}
