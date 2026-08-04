import { Notice, Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, PropertyFromBacklinkSettingTab, PropertyFromBacklinkSettings } from './settings';

export default class PropertyFromBacklinkPlugin extends Plugin {
	settings!: PropertyFromBacklinkSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'tag-backlinks-with-property',
			name: 'Tag backlinks of this note with property',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (!file) return false;
				if (!checking) {
					void this.tagBacklinks(file);
				}
				return true;
			}
		});

		this.addSettingTab(new PropertyFromBacklinkSettingTab(this.app, this));
	}

	async loadSettings() {
			const savedData = (await this.loadData()) as Partial<PropertyFromBacklinkSettings> | null;
			this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData ?? {});
		}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async tagBacklinks(sourceFile: TFile) {
		const propertyName = this.settings.propertyName;
		const propertyValue = sourceFile.basename;
		const resolvedLinks = this.app.metadataCache.resolvedLinks;
		const backlinkPaths: string[] = [];

		for (const path in resolvedLinks) {
			if (resolvedLinks[path]?.[sourceFile.path]) {
				backlinkPaths.push(path);
			}
		}

		let updated = 0;
		let skipped = 0;

		for (const path of backlinkPaths) {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile) || file.extension !== 'md') continue;

			await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
				const existing = fm[propertyName];

				if (existing === undefined || existing === null) {
					fm[propertyName] = propertyValue;
					updated++;
				} else if (Array.isArray(existing)) {
					if (!existing.includes(propertyValue)) {
						existing.push(propertyValue);
						updated++;
					} else {
						skipped++;
					}
				} else if (existing === propertyValue) {
					skipped++;
				} else {
					fm[propertyName] = [existing, propertyValue];
					updated++;
				}
			});
		}

		new Notice(`Property from backlink: ${updated} note(s) updated, ${skipped} already up to date.`);
	}

	onunload(): void {}
}
