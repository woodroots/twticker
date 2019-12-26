const vscode = require('vscode');
const rp = require('request-promise');
const cheerio = require('cheerio');


function activate(context) {
    let config = vscode.workspace.getConfiguration('twticker');


    let disposable = vscode.commands.registerCommand('extension.twticker', function () {
        twTickerUpdate();
    });

    context.subscriptions.push(disposable);

    twTickerItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    twTickerItem.command = 'extension.twticker';
    context.subscriptions.push(twTickerItem);
    twTickerUpdate();
    setInterval(twTickerUpdate, config.get('interval', false) * 60 * 1000);

}

function twTickerUpdate() {
    let config = vscode.workspace.getConfiguration('twticker');
    if (!config.get('account', false)) {
        return;
    }
    const options = {
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp.get('https://mobile.twitter.com/' + config.get('account', false), options).then(function ($) {
        var text = $('.tweet-text').first().children('div').text();
        if (!text) {
            return;
        }
        var text = text.replace(/\n/g, "");
        if (config.get('regexp', false)) {
            let regexp = new RegExp(config.get('regexp', false), 'g');
            var text = text.replace(regexp, "$1");
        }


        twTickerItem.text = config.get('prefix', false) + text;
        twTickerItem.show();

    })
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;