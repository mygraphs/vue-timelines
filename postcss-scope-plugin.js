/**
 * PostCSS plugin to scope all CSS rules to a container selector
 * This ensures CSS doesn't leak outside the web component
 */

export default function postcssScopePlugin(options = {}) {
  const containerSelector = options.containerSelector || '.vue-timeline-container';

  return {
    postcssPlugin: 'postcss-scope',
    Once(root) {
      // Process all rules and wrap them with the container selector
      root.walkRules((rule) => {
        // Skip @keyframes, @media, @supports, etc. - we'll handle them separately
        if (rule.parent && rule.parent.type === 'atrule') {
          const atRule = rule.parent;
          const atRuleName = atRule.name.toLowerCase();

          // For @media, @supports, etc., we need to wrap the inner rules
          if (['media', 'supports', 'container', 'layer'].includes(atRuleName)) {
            // Don't modify - these will be handled by their parent
            return;
          }

          // For @keyframes, don't scope them
          if (atRuleName === 'keyframes') {
            return;
          }
        }

        // Handle :root, html, and body selectors
        if (rule.selector.includes(':root') || rule.selector.includes('html') || rule.selector.includes('body')) {
          rule.selector = rule.selector
            .split(',')
            .map(sel => {
              const trimmed = sel.trim();

              // For standalone :root, replace with container
              if (trimmed === ':root') {
                return containerSelector;
              }

              // Handle cases like ".vt-theme-dark :root" -> ".vue-timeline-container.vt-theme-dark"
              if (trimmed.includes(' :root')) {
                const parts = trimmed.split(/\s+/);
                if (parts.length === 2 && parts[1] === ':root') {
                  // Combine parent class with container: ".vt-theme-dark :root" -> ".vue-timeline-container.vt-theme-dark"
                  const parentClass = parts[0];
                  if (parentClass.startsWith('.')) {
                    return `${containerSelector}${parentClass}`;
                  }
                }
                // Fallback: replace :root with container
                return trimmed.replace(/\s*:root/g, '').replace(/^/, containerSelector + ' ');
              }

              // Handle :root in other contexts
              if (trimmed.includes(':root')) {
                return trimmed.replace(/:root/g, containerSelector);
              }

              // Handle html and body
              if (trimmed.includes('html') || trimmed.includes('body')) {
                return trimmed
                  .replace(/html/g, containerSelector)
                  .replace(/body/g, containerSelector);
              }

              return trimmed;
            })
            .join(',');
          return;
        }

        // Don't scope if already scoped to our container
        if (rule.selector.trim().startsWith(containerSelector)) {
          return;
        }

        // Wrap selector with container
        rule.selector = rule.selector
          .split(',')
          .map(sel => {
            const trimmed = sel.trim();
            // Don't double-wrap
            if (trimmed.startsWith(containerSelector)) {
              return trimmed;
            }
            // Handle :host and other special selectors
            if (trimmed.startsWith(':host')) {
              return trimmed.replace(':host', containerSelector);
            }
            return `${containerSelector} ${trimmed}`;
          })
          .join(',');
      });

      // Handle @media queries - scope rules inside them
      root.walkAtRules('media', (atRule) => {
        atRule.walkRules((rule) => {
          // Skip if already scoped
          if (rule.selector.trim().startsWith(containerSelector)) {
            return;
          }

          // Handle :root inside media queries
          if (rule.selector.includes(':root')) {
            rule.selector = rule.selector.replace(/:root/g, containerSelector);
            return;
          }

          // Wrap selector
          rule.selector = rule.selector
            .split(',')
            .map(sel => {
              const trimmed = sel.trim();
              if (trimmed.startsWith(containerSelector)) {
                return trimmed;
              }
              return `${containerSelector} ${trimmed}`;
            })
            .join(',');
        });
      });
    }
  };
}

postcssScopePlugin.postcss = true;

