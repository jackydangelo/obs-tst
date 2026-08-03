import { Notice, Plugin, TFile } from 'obsidian';

const MOC_PROPERTY = 'moc';

export default class MocTaggerPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'tag-backlinks-as-moc',
			name: 'Tagga i backlink di questa nota come MOC',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (!file) return false;
				if (!checking) {
					this.tagBacklinks(file);
				}
				return true;
			}
		});
	}

	async tagBacklinks(mocFile: TFile) {
		const mocName = mocFile.basename;
		const resolvedLinks = this.app.metadataCache.resolvedLinks;
		const backlinkPaths: string[] = [];

		for (const sourcePath in resolvedLinks) {
			if (resolvedLinks[sourcePath]?.[mocFile.path]) {
				backlinkPaths.push(sourcePath);
			}
		}

		let updated = 0;
		let skipped = 0;

		for (const path of backlinkPaths) {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) continue;

			await this.app.fileManager.processFrontMatter(file, (fm) => {
				const existing = fm[MOC_PROPERTY];

				if (existing === undefined || existing === null) {
					fm[MOC_PROPERTY] = mocName;
					updated++;
				} else if (Array.isArray(existing)) {
					if (!existing.includes(mocName)) {
						existing.push(mocName);
						updated++;
					} else {
						skipped++;
					}
				} else if (existing === mocName) {
					skipped++;
				} else {
					fm[MOC_PROPERTY] = [existing, mocName];
					updated++;
				}
			});
		}

		new Notice(`MOC Tagger: ${updated} note aggiornate, ${skipped} già a posto.`);
	}

	onunload(): void {}
}