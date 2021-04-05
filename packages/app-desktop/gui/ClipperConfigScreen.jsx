const React = require('react');
const { connect } = require('react-redux');
const bridge = require('electron').remote.require('./bridge').default;
const { themeStyle } = require('@joplin/lib/theme');
const { _ } = require('@joplin/lib/locale');
const ClipperServer = require('@joplin/lib/ClipperServer');
const Setting = require('@joplin/lib/models/Setting').default;
const { clipboard } = require('electron');
const ExtensionBadge = require('./ExtensionBadge.min');
const EncryptionService = require('@joplin/lib/services/EncryptionService').default;

class ClipperConfigScreenComponent extends React.Component {
	constructor() {
		super();

		this.copyToken_click = this.copyToken_click.bind(this);
	}

	disableClipperServer_click() {
		Setting.setValue('clipperServer.autoStart', false);
		ClipperServer.instance().stop();
	}

	enableClipperServer_click() {
		Setting.setValue('clipperServer.autoStart', true);
		ClipperServer.instance().start();
	}

	chromeButton_click() {
		bridge().openExternal('https://chrome.google.com/webstore/detail/joplin-web-clipper/alofnhikmmkdbbbgpnglcpdollgjjfek');
	}

	firefoxButton_click() {
		bridge().openExternal('https://addons.mozilla.org/en-US/firefox/addon/joplin-web-clipper/');
	}

	copyToken_click() {
		clipboard.writeText(this.props.apiToken);

		alert(_('Token has been copied to the clipboard!'));
	}

	renewToken_click() {
		if (confirm(_('Are you sure you want to renew the authorisation token?'))) {
			void EncryptionService.instance()
				.generateApiToken()
				.then((token: string) => {
					Setting.setValue('api.token', token);
				});
		}
	}

	render() {
		const theme = themeStyle(this.props.themeId);

		const containerStyle = Object.assign({}, theme.containerStyle, {
			overflowY: 'scroll',
			padding: theme.configScreenPadding,
			backgroundColor: theme.backgroundColor3,
		});

		const buttonStyle = Object.assign({}, theme.buttonStyle, { marginRight: 10 });

		const stepBoxStyle = {
			border: '1px solid',
			borderColor: theme.dividerColor,
			padding: 15,
			paddingTop: 0,
			marginBottom: 15,
			backgroundColor: theme.backgroundColor,
		};

		const webClipperStatusComps = [];

		if (this.props.clipperServerAutoStart) {
			webClipperStatusComps.push(
				<p key="text_1" style={theme.textStyle}>
					<b>{_('The web clipper service is enabled and set to auto-start.')}</b>
				</p>
			);
			if (this.props.clipperServer.startState === 'started') {
				webClipperStatusComps.push(
					<p key="text_2" style={theme.textStyle}>
						{_('Status: Started on port %d', this.props.clipperServer.port)}
					</p>
				);
			} else {
				webClipperStatusComps.push(
					<p key="text_3" style={theme.textStyle}>
						{_('Status: %s', this.props.clipperServer.startState)}
					</p>
				);
			}
			webClipperStatusComps.push(
				<button key="disable_button" style={buttonStyle} onClick={this.disableClipperServer_click}>
					{_('Disable Web Clipper Service')}
				</button>
			);
		} else {
			webClipperStatusComps.push(
				<p key="text_4" style={theme.textStyle}>
					{_('The web clipper service is not enabled.')}
				</p>
			);
			webClipperStatusComps.push(
				<button key="enable_button" style={buttonStyle} onClick={this.enableClipperServer_click}>
					{_('Enable Web Clipper Service')}
				</button>
			);
		}

		const apiTokenStyle = Object.assign({}, theme.textStyle, {
			color: theme.colorFaded,
			wordBreak: 'break-all',
			paddingTop: 10,
			paddingBottom: 10,
		});

		return (
			<div>
				<div style={containerStyle}>
					<div>
						<p style={Object.assign({}, theme.textStyle, { marginTop: 0 })}>{_('Joplin Web Clipper allows saving web pages and screenshots from your browser to Joplin.')}</p>
						<p style={theme.textStyle}>{_('In order to use the web clipper, you need to do the following:')}</p>

						<div style={stepBoxStyle}>
							<p style={theme.h1Style}>{_('Step 1: Enable the clipper service')}</p>
							<p style={theme.textStyle}>{_('This service allows the browser extension to communicate with Joplin. When enabling it your firewall may ask you to give permission to Joplin to listen to a particular port.')}</p>
							<div>{webClipperStatusComps}</div>
						</div>

						<div style={stepBoxStyle}>
							<p style={theme.h1Style}>{_('Step 2: Install the extension')}</p>
							<p style={theme.textStyle}>{_('Download and install the relevant extension for your browser:')}</p>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<ExtensionBadge themeId={this.props.themeId} type="firefox" url="https://addons.mozilla.org/en-US/firefox/addon/joplin-web-clipper/"/>
								<ExtensionBadge style={{ marginLeft: 10 }} themeId={this.props.themeId} type="chrome" url="https://chrome.google.com/webstore/detail/joplin-web-clipper/alofnhikmmkdbbbgpnglcpdollgjjfek"/>
							</div>
						</div>

						<div style={stepBoxStyle}>
							<p style={theme.h1Style}>{_('Advanced options')}</p>
							<p style={theme.textStyle}>{_('Authorisation token:')}</p>
							<p style={apiTokenStyle}>
								{this.props.apiToken}{' '}
								<a style={theme.urlStyle} href="#" onClick={this.copyToken_click}>
									{_('Copy token')}
								</a>
							</p>
							<p style={theme.textStyle}>{_('This authorisation token is only needed to allow third-party applications to access Joplin.')}</p>
							<div>
								<button key="renew_button" style={buttonStyle} onClick={this.renewToken_click}>
									{_('Renew token')}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		themeId: state.settings.theme,
		clipperServer: state.clipperServer,
		clipperServerAutoStart: state.settings['clipperServer.autoStart'],
		apiToken: state.settings['api.token'],
	};
};

const ClipperConfigScreen = connect(mapStateToProps)(ClipperConfigScreenComponent);

module.exports = { ClipperConfigScreen };
