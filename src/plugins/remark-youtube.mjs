import { visit } from 'unist-util-visit';

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch {}
  return null;
}

export function remarkYoutube() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (node.children.length !== 1) return;
      const child = node.children[0];
      const url = child.type === 'link' ? child.url : child.type === 'text' ? child.value.trim() : null;
      if (!url) return;
      const id = youtubeId(url);
      if (!id) return;
      parent.children.splice(index, 1, {
        type: 'html',
        value: `<div class="video-raam"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>`,
      });
    });
  };
}
