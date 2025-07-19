# Merlin's Grimoire: UI Design Guide

## Design Philosophy

**Visual Style**: Early 2000s retro gaming aesthetic with magical wizard themes, reminiscent of 32-bit era games like Final Fantasy, Secret of Mana, and classic RPGs.

**Color Palette**: 
- **Primary**: Deep mystical purple (#4A148C, #6A1B9A)
- **Secondary**: Rich brown leather (#3E2723, #5D4037) 
- **Accent**: Golden yellow (#FFB300, #FFC107)
- **Magical Blue**: Ethereal cyan (#00BCD4, #0097A7)
- **Background**: Dark slate (#263238, #37474F)

**Typography**: 
- **Primary Font**: "Alagard"  - pixelated medieval-style font
- **Body Text**: "m6x11" - clean pixel fonts for readable text (see assets/fonts)

## Core UI Elements

### Frame and Border System
- **Window Frames**: Ornate medieval-style borders with corner decorations
- **Material**: Weathered parchment texture with leather binding edges
- **Borders**: 8-pixel wide ornate frames with mystical runes in corners
- **Shadows**: 2-pixel drop shadows in dark purple (#2A1A4A)

### Button Styling
- **Default State**: Raised leather-textured buttons with golden trim
- **Hover State**: Slight glow effect in magical blue
- **Pressed State**: Inset appearance with darker shadow
- **Disabled State**: Grayed out with 50% opacity

### Text Styling
- **Headers**: Golden yellow text with 1-pixel black outline
- **Body Text**: White or light gray (#E0E0E0) on dark backgrounds
- **Links/Interactive**: Magical blue with underline on hover
- **Error Text**: Red (#F44336) with warning icon

## Main Menu Interface

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│  [ORNATE BORDER WITH MAGICAL RUNES]            │
│                                                 │
│           MERLIN'S GRIMOIRE                     │
│         [Mystical Title Logo]                   │
│                                                 │
│              [START GAME]                       │
│              [MERLIN'S JOURNAL]                 │
│              [QUIT GAME]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Visual Elements
- **Background**: Animated starfield with floating mystical particles
- **Title Logo**: Ornate text with magical sparkle effects
- **Menu Buttons**: Scroll-like appearance with wax seal decorations
- **Ambient Effects**: Subtle pulsing glow around interactive elements

## Login/User Selection Screen

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│  [ORNATE BORDER]                                │
│                                                 │
│         CHOOSE YOUR ACADEMIC LEVEL              │
│                                                 │
│    [High School Chemistry 1]                   │
│    [Advanced Placement Chemistry]              │
│    [Organic Chemistry]                         │
│    [Biochemistry]                              │
│                                                 │
│                                                 │
│              [CONTINUE]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Visual Elements
- **Background**: Faded alchemical laboratory with bubbling potions
- **Selection Cards**: Leather-bound book covers with magical symbols
- **Input Fields**: Parchment-textured with quill pen cursor
- **Hover Effects**: Books glow with subject-specific colors

## Merlin's Journal Interface

### Layout Structure (Based on Provided Image)
```
┌─────────────────────────────────────────────────┐
│ [X] MERLIN'S JOURNAL                            │
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────┐   │
│  │  [MAGICAL   │  │  LESSON CONTENT         │   │
│  │   VISUAL]   │  │                         │   │
│  │             │  │  Lorem ipsum dolor sit  │   │
│  │    [RUNE    │  │  amet, consectetur      │   │
│  │   SYMBOLS]  │  │  adipiscing elit...     │   │
│  │             │  │ {Should be scrollable}  │   │
│  └─────────────┘  │  [ARROW BUTTONS]        │   │
│                   │                         │   │
│  [REACTION SLOTS] │  [CONFIRM BUTTON]       │   │
│                   └─────────────────────────┘   │
│                                                 │
│  [TABS: LESSONS | REACTIONS | PROGRESS]        │
└─────────────────────────────────────────────────┘
```

### Visual Elements
- **Background**: Ancient tome with aged parchment texture
- **Pages**: Realistic book binding with visible stitching
- **Handwritten Style**: Text appears as if written with quill and ink
- **Magical Illustrations**: Animated diagrams of chemical reactions
- **Navigation**: Bookmark tabs with mystical symbols

### Tab System
- **Current Study**: Active lesson content with glowing border
- **Reaction Database**: Grid of attempted reactions with success/failure indicators
- **Progress Tracking**: Skill trees with unlocked/locked abilities
- **Past Lessons**: Historical content with completion checkmarks

## Apothecary Chamber (Potion Crafting)

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│  [TIME DILATION EFFECT BORDER]                  │
│                                                 │
│  APOTHECARY CHAMBER                             │
│                                                 │
│  ┌─────────────┐    ┌─────────────────────┐     │
│  │  INVENTORY  │    │    RECIPE BOOK      │     │
│  │             │    │{carosel 2 flip thru}│     │
│  │ [ITEM GRID] │    │ Requires:           │     │
│  │             │    │ • 1x Frost Giant    │     │
│  │             │    │ • 1x Mercury Vial   │     │
│  └─────────────┘    └─────────────────────┘     │
│                                                 │
│           ┌─────────────────────┐               │
│           │     CAULDRON        │               │
│           │                     │               │
│           │ *Chemistry Problem* │               │
│           │                     │               │
│           └─────────────────────┘               │
│                                                 │
│  [CHEMISTRY QUESTION PANEL]                     │
│  [ANSWER INPUT FIELD]                           │
│  [SUBMIT REACTION]                              │
└─────────────────────────────────────────────────┘
```

### Visual Elements
- **Time Dilation**: Swirling energy borders with particle effects
- **Cauldron**: Bubbling animation with ingredient-specific colors
- **Ingredient Slots**: Drag-and-drop zones with mystical glow
- **Chemistry Panel**: Scroll-like appearance with diagrams
- **Feedback System**: Success sparkles, failure explosions

## Spell Casting Interface

## Spell Casting Interface

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│  [FULL GAME WORLD - ACTIVE GAMEPLAY]           │
│                                                 │
│                                                 │
│  [ENEMY/DOOR TARGET]                           │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Question: "How many neutrons are in     │   │
│  │ carbon-12?"                             │   │
│  │                                         │   │
│  │ [MICROPHONE ACTIVE INDICATOR]           │   │
│  │ [TYPING FALLBACK INPUT]                 │   │
│  │                                         │   │
│  │ [SPELL LOADINGS: ●●○]                   │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Visual Elements
- **Full Screen Gameplay**: Game world remains fully active and visible
- **Bottom Pop-up Panel**: Small overlay at bottom of screen with question
- **Activation**: Player presses keyboard button to activate spellcasting mode
- **Voice Indicator**: Pulsing magical circle with sound waves
- **Spell Loadings**: Glowing orbs representing available casts within the panel
- **Target Highlight**: Enemy/door outlined with spell-colored aura
- **Seamless Integration**: Panel appears/disappears without interrupting gameplay
```

### Visual Elements
- **Subtitle Style**: Question appears as mystical floating text
- **Voice Indicator**: Pulsing magical circle with sound waves
- **Spell Loadings**: Glowing orbs representing available casts
- **Target Highlight**: Enemy/door outlined with spell-colored aura

## Pop-up Modals and Dialogs

### Standard Modal Structure
```
┌─────────────────────────────────────────────────┐
│  [ORNATE BORDER WITH DARKENED OVERLAY]         │
│                                                 │
│              [MODAL TITLE]                      │
│                                                 │
│  [CONTENT AREA]                                 │
│                                                 │
│                                                 │
│                                                 │
│              [ACTION BUTTONS]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Modal Types

#### Success Modal
- **Border**: Golden glow with success particles
- **Icon**: Sparkling potion or spell symbol
- **Colors**: Green success palette (#4CAF50)
- **Animation**: Gentle pulsing effect

#### Failure Modal
- **Border**: Red warning glow with smoke effects
- **Icon**: Explosion or broken potion
- **Colors**: Red warning palette (#F44336)
- **Animation**: Shaking/trembling effect

#### Information Modal
- **Border**: Blue mystical glow
- **Icon**: Scroll or book symbol
- **Colors**: Blue information palette (#2196F3)
- **Animation**: Gentle floating effect

#### Level Selection Modal
- **Border**: Purple magical aura
- **Content**: Subject cards with preview images
- **Colors**: Purple/gold theme
- **Animation**: Cards flip on hover

## Settings Interface *IGNORE FOR MVP*

### Layout Structure Example
```
┌─────────────────────────────────────────────────┐
│  [ORNATE BORDER]                                │
│                                                 │
│                 SETTINGS                        │
│                                                 │
│  Audio Settings:                                │
│  Master Volume:    [====|----]                  │
│  Music Volume:     [======|--]                  │
│  SFX Volume:       [=====|---]                  │
│  Voice Volume:     [===|-----]                  │
│                                                 │
│  Gameplay Settings:                             │
│  Difficulty:       [Normal  ▼]                  │
│  Voice Input:      [ON  ▼]                      │
│  Subtitles:        [ON  ▼]                      │
│  Auto-Save:        [ON  ▼]                      │
│                                                 │
│  [RESET TO DEFAULT]    [APPLY]    [CANCEL]      │
└─────────────────────────────────────────────────┘
```

### Visual Elements
- **Sliders**: Mystical crystals as handles with magical trails
- **Dropdowns**: Scroll-like menus with wax seal arrows
- **Checkboxes**: Magical runes that glow when activated
- **Buttons**: Consistent with main menu styling

## Text Input and Form Elements

### Input Field Styling
- **Background**: Aged parchment texture
- **Border**: Thin brown leather binding
- **Cursor**: Animated quill pen with ink trail
- **Focus State**: Magical blue glow around border
- **Placeholder**: Faded gray italic text

### Dropdown Menus
- **Closed State**: Scroll appearance with wax seal
- **Open State**: Unfurled scroll with options
- **Selection**: Highlighted with golden background
- **Hover**: Subtle glow effect

### Checkbox and Radio Buttons
- **Unchecked**: Empty mystical circle or rune
- **Checked**: Filled with magical energy
- **Disabled**: Grayed out with crack effect

## Loading and Progress Indicators

### Loading Screen
- **Background**: Animated cauldron with bubbling effects
- **Progress Bar**: Filling potion bottle with ingredient colors
- **Text**: "Preparing the Laboratory..." with loading dots
- **Animation**: Swirling magical particles

### Progress Bars
- **Container**: Weathered bronze or copper frame
- **Fill**: Glowing liquid that changes color by percentage
- **Text**: Percentage displayed in golden numbers
- **Animation**: Gentle liquid movement

## Notification System

### Toast Notifications
- **Position**: Top-right corner with slide-in animation
- **Success**: Green border with checkmark icon
- **Warning**: Yellow border with exclamation icon
- **Error**: Red border with X icon
- **Information**: Blue border with info icon

### Achievement Notifications
- **Appearance**: Ornate banner with ribbon effects
- **Animation**: Slides down from top with fanfare
- **Duration**: 3-5 seconds with manual dismiss option
- **Sound**: Magical chime or achievement sound

## Responsive Design Considerations

### Mobile Adaptations
- **Touch Targets**: Minimum 44px for comfortable tapping
- **Text Scaling**: Larger base font sizes for readability
- **Layout**: Simplified single-column layouts
- **Gestures**: Swipe navigation for journal pages

### Desktop Enhancements
- **Hover Effects**: Rich interactive feedback
- **Keyboard Navigation**: Full tab order support
- **Context Menus**: Right-click options where appropriate
- **Tooltips**: Detailed help text on hover

## Animation and Transitions

### Micro-Animations
- **Button Presses**: Slight scale and glow effects
- **Page Transitions**: Magical wipe effects
- **Loading States**: Pulsing and particle effects
- **Success/Failure**: Particle bursts and screen shakes

### Timing
- **Quick Feedback**: 150-200ms for immediate responses
- **Transitions**: 300-500ms for page changes
- **Animations**: 1-2 seconds for complex effects
- **Ambient**: Continuous subtle effects

## Accessibility Features

### Visual Accessibility
- **High Contrast**: Alternative color schemes
- **Font Scaling**: Adjustable text sizes
- **Motion Reduction**: Disable animations option
- **Color Blindness**: Alternative visual indicators

### Audio Accessibility
- **Subtitles**: For all spoken content
- **Visual Indicators**: For audio cues
- **Volume Controls**: Independent audio channels
- **Screen Reader**: Proper ARIA labels

### Input Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Voice Input**: Alternative to microphone
- **Touch Assistance**: Larger touch targets
- **Motor Impairment**: Adjustable timing windows

## Implementation Notes

### Technical Considerations
- **Phaser Integration**: UI elements as game objects
- **Responsive Scaling**: Maintain aspect ratios
- **Performance**: Efficient sprite batching
- **Memory**: Proper texture management

### Asset Requirements
- **Fonts**: Web-safe pixel fonts with fallbacks
- **Textures**: Tileable patterns for borders
- **Icons**: Consistent pixel art style
- **Animations**: Sprite sheets for complex effects

### Testing Guidelines
- **Cross-Browser**: Ensure consistent rendering
- **Device Testing**: Various screen sizes
- **Performance**: Frame rate monitoring
- **Accessibility**: Screen reader compatibility

This UI guide provides a comprehensive foundation for creating a cohesive, engaging, and accessible interface for Merlin's Grimoire that captures the magical, educational, and retro gaming aesthetic outlined in the PRD.