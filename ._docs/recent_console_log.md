Hmm, the game froze again, also, these were some of the troublesome outputs in the browser console: phaser.js?v=cca867e7:2271 Frame "0" not found in texture "spell-bot"
generateFrameNames @ phaser.js?v=cca867e7:2271Understand this warning
phaser.js?v=cca867e7:2271 Frame "1" not found in texture "spell-bot"
generateFrameNames @ phaser.js?v=cca867e7:2271Understand this warning
phaser.js?v=cca867e7:2271 Frame "2" not found in texture "spell-bot"
generateFrameNames @ phaser.js?v=cca867e7:2271Understand this warning
SpellBot.ts:16 SpellBot created ... and this was error: Uncaught TypeError: Cannot read properties of undefined (reading 'frame')
    at AnimationState2.setCurrentFrame (phaser.js?v=cca867e7:3475:57)
    at AnimationState2.handleStart (phaser.js?v=cca867e7:3060:26)
    at AnimationState2.startAnimation (phaser.js?v=cca867e7:3043:28)
    at AnimationState2.play (phaser.js?v=cca867e7:2938:33)
    at SpellBot.play (phaser.js?v=cca867e7:45882:39)
    at SpellBot.preUpdate (SpellBot.ts:53:14)
    at UpdateList2.sceneUpdate (phaser.js?v=cca867e7:18578:46)
    at EventEmitter2.emit (phaser.js?v=cca867e7:119:43)
    at Systems2.step (phaser.js?v=cca867e7:112405:28)
    at SceneManager2.update (phaser.js?v=cca867e7:110558:29)