import { describe, it, expect } from 'vitest';
import type { Pane } from '../types/terminal';
import {
  getLeafPanes,
  splitPaneInTree,
  closePaneInTree,
  updatePanePtyInTree,
} from './paneTree';

const pane = (id: string, ptyId: string | null = null): Pane => ({ id, ptyId });

describe('getLeafPanes', () => {
  it('returns the pane itself when it has no children', () => {
    const p = pane('a');
    expect(getLeafPanes(p)).toEqual([p]);
  });

  it('flattens nested split trees depth-first', () => {
    const tree: Pane = {
      id: 'parent',
      ptyId: null,
      direction: 'horizontal',
      size: 50,
      children: [
        { ...pane('a') },
        {
          id: 'parent2',
          ptyId: null,
          direction: 'vertical',
          size: 50,
          children: [{ ...pane('b') }, { ...pane('c') }],
        },
      ],
    };
    expect(getLeafPanes(tree).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('splitPaneInTree', () => {
  it('wraps the target pane in a new parent with the new pane as sibling', () => {
    const panes = [pane('a'), pane('b')];
    const newPane = pane('c');
    const result = splitPaneInTree(panes, 'a', newPane, 'vertical');

    expect(result).toBe(true);
    expect(panes.length).toBe(2);
    const parent = panes[0];
    expect(parent.id).not.toBe('a');
    expect(parent.direction).toBe('vertical');
    expect(parent.children?.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('descends into nested children', () => {
    const panes: Pane[] = [
      {
        id: 'parent',
        ptyId: null,
        direction: 'horizontal',
        size: 50,
        children: [pane('a'), pane('b')],
      },
    ];
    const result = splitPaneInTree(panes, 'b', pane('c'), 'horizontal');
    expect(result).toBe(true);
    const inner = panes[0].children?.[1];
    expect(inner?.children?.map((c) => c.id)).toEqual(['b', 'c']);
    expect(inner?.direction).toBe('horizontal');
  });

  it('does not mutate the tree when the target is missing', () => {
    const panes = [pane('a')];
    const snapshot = JSON.stringify(panes);
    expect(splitPaneInTree(panes, 'nope', pane('c'), 'vertical')).toBe(false);
    expect(JSON.stringify(panes)).toBe(snapshot);
  });

  it('can split a pane that already lives under a parent', () => {
    const panes = [pane('a')];
    splitPaneInTree(panes, 'a', pane('c'), 'vertical');
    splitPaneInTree(panes, 'c', pane('d'), 'vertical');

    const children = panes[0].children!;
    expect(children[0].id).toBe('a');
    const secondParent = children[1];
    expect(secondParent.id).not.toBe('c');
    expect(secondParent.direction).toBe('vertical');
    expect(secondParent.children?.map((c) => c.id)).toEqual(['c', 'd']);
  });
});

describe('closePaneInTree', () => {
  it('replaces a parent with the remaining sibling', () => {
    const panes: Pane[] = [
      {
        id: 'parent',
        ptyId: null,
        direction: 'vertical',
        size: 50,
        children: [pane('a', 'pty-a'), pane('b', 'pty-b')],
      },
    ];
    const closed: string[] = [];
    const result = closePaneInTree(panes, 'b', (pty) => closed.push(pty));

    expect(result).toBe(true);
    expect(panes[0].id).toBe('a');
    expect(closed).toEqual(['pty-b']);
  });

  it('collects pty ids of nested panes being removed', () => {
    const panes: Pane[] = [
      {
        id: 'parent',
        ptyId: null,
        direction: 'vertical',
        size: 50,
        children: [
          pane('a', 'pty-a'),
          {
            id: 'nested',
            ptyId: null,
            direction: 'horizontal',
            size: 50,
            children: [pane('b', 'pty-b'), pane('c', 'pty-c')],
          },
        ],
      },
    ];
    const closed: string[] = [];
    closePaneInTree(panes, 'b', (pty) => closed.push(pty));
    expect(closed).toEqual(['pty-b']);
  });

  it('returns false and does not mutate when target is absent', () => {
    const panes = [pane('a')];
    // kill an unused leaf while closing a pane
    const closed: string[] = [];
    const snapshot = JSON.stringify(panes);
    expect(closePaneInTree(panes, 'missing', (pty) => closed.push(pty))).toBe(false);
    expect(JSON.stringify(panes)).toBe(snapshot);
    expect(closed).toEqual([]);
  });
});

describe('updatePanePtyInTree', () => {
  it('assigns a pty id to a leaf', () => {
    const panes = [pane('a')];
    expect(updatePanePtyInTree(panes, 'a', 'pty-1')).toBe(true);
    expect(panes[0].ptyId).toBe('pty-1');
  });

  it('finds nested panes', () => {
    const panes: Pane[] = [
      {
        id: 'parent',
        ptyId: null,
        direction: 'vertical',
        size: 50,
        children: [
          pane('a'),
          { ...pane('b'), children: [{ ...pane('c') }, { ...pane('d') }] },
        ],
      },
    ];
    expect(updatePanePtyInTree(panes, 'd', 'pty-d')).toBe(true);
    const nested = panes[0].children![1].children!;
    expect(nested[1].ptyId).toBe('pty-d');
  });

  it('keeps parent state intact when updating a descendant', () => {
    const panes: Pane[] = [
      {
        id: 'parent',
        ptyId: null,
        direction: 'vertical',
        size: 50,
        children: [pane('a'), pane('b')],
      },
    ];
    updatePanePtyInTree(panes, 'a', 'pty-a');
    expect(panes[0].direction).toBe('vertical');
    expect(panes[0].size).toBe(50);
    expect(panes[0].children![0].ptyId).toBe('pty-a');
  });
});