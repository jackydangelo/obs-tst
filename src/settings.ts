import { App, PluginSettingTab, Setting } from 'obsidian';
import type PropertyFromBacklinkPlugin from './main';

export interface PropertyFromBacklinkSettings {
	propertyName: string;
}

export const DEFAULT_SETTINGS: PropertyFromBacklinkSettings = {
	propertyName: 'moc'
};

export class PropertyFromBacklinkSettingTab extends PluginSettingTab {
	plugin: PropertyFromBacklinkPlugin;

	constructor(app: App, plugin: PropertyFromBacklinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Property name')
			.setDesc('The frontmatter property added to backlinking notes.')
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.propertyName)
					.setValue(this.plugin.settings.propertyName)
					.onChange(async (value) => {
						const sanitized = value.trim().replace(/[^a-zA-Z0-9_-]/g, '');
						this.plugin.settings.propertyName = sanitized || DEFAULT_SETTINGS.propertyName;
						await this.plugin.saveSettings();
					})
			);
	}
}
