# Navigation Guide - Transform Army AI

## Two-Page Navigation System

Transform Army AI has a seamless navigation system between **Agent Forge** and **Mission Control**.

---

## 🔄 Navigation Paths

### From Agent Forge → Mission Control

**When you can navigate**:
- After creating at least one agent
- Once agents are deployed

**How to navigate**:
1. **Button Method**: Click the **"🎛 Mission Control"** button (bottom right corner)
   - Appears only when agents exist
   - Blue/Red gradient button
   - Click to open Mission Control

2. **URL Method**: Navigate to `http://localhost:5173/mission-control`
   - Direct URL navigation
   - Works even without a button

---

### From Mission Control → Agent Forge

**How to navigate**:
1. **Back Button**: Click the **"← FORGE"** button (top left corner)
   - Blue button next to "MISSION CONTROL" title
   - Always visible in Mission Control
   - Click to return to Agent Forge

2. **URL Method**: Navigate to `http://localhost:5173/` or `http://localhost:5173/forge`
   - Direct URL navigation

---

## 🗺️ Navigation Map

```
┌─────────────────────────────────────────────┐
│           AGENT FORGE (/forge)              │
│                                             │
│ • Create agents                             │
│ • Configure teams, roles, languages         │
│ • Select LLM providers                      │
│ • Manage tools                              │
│                                             │
│ [🎛 Mission Control Button]                 │
│ (appears when agents exist)                 │
└──────────────────┬──────────────────────────┘
                   │
                   │ Click 🎛 Button
                   │ OR
                   │ URL: /mission-control
                   ↓
┌─────────────────────────────────────────────┐
│      MISSION CONTROL (/mission-control)     │
│                                             │
│ [← FORGE Button]                            │
│ (top left, always visible)                  │
│                                             │
│ • Monitor agents in real-time               │
│ • View unified logs                         │
│ • Send orchestrator commands                │
│ • Manage mission lifecycle                  │
└──────────────────┬──────────────────────────┘
                   │
                   │ Click ← FORGE Button
                   │ OR
                   │ URL: /forge
                   ↓
         Back to AGENT FORGE
```

---

## 🎯 Quick Navigation Reference

| From | To | Button | URL | Keyboard |
|------|-----|--------|-----|----------|
| Forge | Mission Control | 🎛 (bottom right) | `/mission-control` | - |
| Mission Control | Forge | ← FORGE (top left) | `/forge` or `/` | - |

---

## 🔗 Button Locations

### Agent Forge
```
┌─────────────────────────────────────────┐
│                                         │
│  [Agent Configuration Area]             │
│                                         │
│                                         │
│                                         │
│                              [🎛] ← HERE
│                              (bottom right)
└─────────────────────────────────────────┘
```

### Mission Control
```
┌────────────────────────────────────────────────┐
│ [← FORGE] MISSION CONTROL [Status][Timer][Agents]
│ ↑                                              │
│ HERE                                           │
│ (top left)                                     │
│                                                │
│  [Agent Roster]    [Unified Logs]             │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 💡 Tips

1. **Always Go Back** - The "← FORGE" button is always visible in Mission Control
2. **Create Agents First** - The 🎛 button only appears after creating agents
3. **URL Navigation** - You can always navigate via URL if buttons aren't visible
4. **Browser Back** - Browser back button also works to navigate between pages
5. **Shared State** - Both pages share the same MissionContext, so state persists

---

## 🚀 Workflow Example

```
1. Open Agent Forge
   ↓
2. Create a System agent
   ↓
3. 🎛 Mission Control button appears
   ↓
4. Click 🎛 to go to Mission Control
   ↓
5. Mission starts automatically
   ↓
6. View real-time agent status
   ↓
7. Click ← FORGE to go back
   ↓
8. Create more agents in Forge
   ↓
9. Back to Mission Control to manage all agents
```

---

## 🆘 Troubleshooting

### Problem: Can't see 🎛 Mission Control button
**Solution**: Create at least one agent first in Agent Forge

### Problem: Can't find ← FORGE button
**Solution**: It's in the top-left corner of Mission Control header. Try scrolling up if header is cut off.

### Problem: Navigation not working
**Solution**: Try URL navigation:
- To Forge: `http://localhost:5173/forge`
- To Mission Control: `http://localhost:5173/mission-control`

### Problem: State not persisting between pages
**Solution**: State is shared via MissionContext. Both pages use the same context, so data should persist.

---

## 📋 Navigation Checklist

- ✅ Can navigate from Forge to Mission Control via button
- ✅ Can navigate from Forge to Mission Control via URL
- ✅ Can navigate from Mission Control to Forge via button
- ✅ Can navigate from Mission Control to Forge via URL
- ✅ State persists between page transitions
- ✅ Buttons visible and properly styled
- ✅ No console errors on navigation

---

**Ready to explore!** 🚀

Start in Agent Forge, create some agents, then click the 🎛 button to see Mission Control in action!
