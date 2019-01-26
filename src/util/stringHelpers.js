module.exports = {
    ensure0x: (s) => (s.startsWith('0x') ? s : `0x${s}`),
    ensureNo0x: (s) => s.replace('0x', ''),
};
