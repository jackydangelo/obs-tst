import { Notice, Plugin } from 'obsidian';

export default class HelloWorldPlugin extends Plugin {
	async onload() {
		this.addRibbonIcon('dice', 'Hello World', () => {
			new Notice('Ciao dal tuo plugin!');
		});

		this.addCommand({
			id: 'hello-world-say-hello',
			name: 'Di ciao',
			callback: () => {
				new Notice('Ciao, mondo!');
			}
		});
	}

	onunload(): void {}
}