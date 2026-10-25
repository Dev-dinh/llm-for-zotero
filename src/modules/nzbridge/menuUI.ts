/**
 * Right-click context menus on Zotero collections for n2z sync actions.
 */

/**
 * Registers context menu items on collections.
 */
export function registerMenus(): void {
  // "Sync to NotebookLM" on collection right-click
  ztoolkit.Menu.register("collection", {
    tag: "menuitem",
    id: "n2z-sync-to-notebooklm",
    label: "Sync to NotebookLM",
    commandListener: (_ev) => {
      onSyncToNotebookLM();
    },
  });

  // "Import Notes from NotebookLM" on collection right-click
  ztoolkit.Menu.register("collection", {
    tag: "menuitem",
    id: "n2z-import-from-notebooklm",
    label: "Import Notes from NotebookLM",
    commandListener: (_ev) => {
      onImportFromNotebookLM();
    },
  });
}

/**
 * Returns the currently selected collection, or null if none is selected.
 */
function getSelectedCollection(): Zotero.Collection | null {
  const zoteroPane = Zotero.getActiveZoteroPane() as any;

  if (typeof zoteroPane.getSelectedCollections === "function") {
    const collections = zoteroPane.getSelectedCollections();
    return collections?.length ? collections[0] : null;
  }

  return zoteroPane.getSelectedCollection() || null;
}

/**
 * Handler: user requests forward sync on a collection.
 * Shows a notification since actual sync is driven by the browser extension.
 */
function onSyncToNotebookLM(): void {
  const collection = getSelectedCollection();

  if (!collection) {
    showNotification("Please select a collection first.", "default");
    return;
  }

  showNotification(
    `Ready to sync "${collection.name}" to NotebookLM. Open the Sync for Zotero extension to start.`,
    "default",
  );
}

/**
 * Handler: user requests backward sync (import notes from NotebookLM).
 * Shows a notification since actual import is driven by the browser extension.
 */
function onImportFromNotebookLM(): void {
  const collection = getSelectedCollection();

  if (!collection) {
    showNotification("Please select a collection first.", "default");
    return;
  }

  showNotification(
    `Ready to import notes into "${collection.name}". Open the Sync for Zotero extension to start.`,
    "default",
  );
}

function showNotification(
  text: string,
  type: "default" | "warning" | "alert" = "default",
): void {
  try {
    new ztoolkit.ProgressWindow("Sync for Zotero (NZBridge)", {
      closeOnClick: true,
      closeTime: -1,
    })
      .createLine({
        text,
        type,
      })
      .show()
      .startCloseTimer(5000);
  } catch (e) {
    ztoolkit.log(`[n2z] Notification: ${text}`);
  }
}
