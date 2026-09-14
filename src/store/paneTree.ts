import type { Pane } from '../types/terminal';
import { uid } from '../lib/uid';

export function getLeafPanes(pane: Pane): Pane[] {
  if (!pane.children || pane.children.length === 0) {
    return [pane];
  }
  return pane.children.flatMap(getLeafPanes);
}

export function splitPaneInTree(
  panes: Pane[],
  targetId: string,
  newPane: Pane,
  direction: 'horizontal' | 'vertical'
): boolean {
  for (let i = 0; i < panes.length; i++) {
    const pane = panes[i];
    if (pane.id === targetId) {
      const oldPaneCopy = { ...pane };
      panes[i] = {
        id: uid('pane-parent'),
        ptyId: null,
        direction,
        children: [oldPaneCopy, newPane],
        size: 50,
      };
      return true;
    }
    if (pane.children) {
      const childrenCopy = [...pane.children];
      if (splitPaneInTree(childrenCopy, targetId, newPane, direction)) {
        panes[i] = { ...pane, children: childrenCopy };
        return true;
      }
    }
  }
  return false;
}

export function closePaneInTree(
  panes: Pane[],
  targetId: string,
  onClosedPty: (ptyId: string) => void
): boolean {
  for (let i = 0; i < panes.length; i++) {
    const pane = panes[i];
    if (pane.children) {
      const targetIndex = pane.children.findIndex((c) => c.id === targetId);
      if (targetIndex !== -1) {
        const removedPane = pane.children[targetIndex];
        if (removedPane.ptyId) {
          onClosedPty(removedPane.ptyId);
        }
        if (removedPane.children) {
          closePaneChildren(removedPane.children, onClosedPty);
        }
        const remainingIndex = targetIndex === 0 ? 1 : 0;
        panes[i] = pane.children[remainingIndex];
        return true;
      }

      const childrenCopy = [...pane.children];
      if (closePaneInTree(childrenCopy, targetId, onClosedPty)) {
        panes[i] = { ...pane, children: childrenCopy };
        return true;
      }
    }
  }
  return false;
}

function closePaneChildren(panes: Pane[], onClosedPty: (ptyId: string) => void) {
  for (const pane of panes) {
    if (pane.ptyId) {
      onClosedPty(pane.ptyId);
    }
    if (pane.children) {
      closePaneChildren(pane.children, onClosedPty);
    }
  }
}

export function updatePanePtyInTree(panes: Pane[], paneId: string, ptyId: string): boolean {
  for (let i = 0; i < panes.length; i++) {
    const pane = panes[i];
    if (pane.id === paneId) {
      panes[i] = { ...pane, ptyId };
      return true;
    }
    if (pane.children) {
      const childrenCopy = [...pane.children];
      if (updatePanePtyInTree(childrenCopy, paneId, ptyId)) {
        panes[i] = { ...pane, children: childrenCopy };
        return true;
      }
    }
  }
  return false;
}