// LaunchBar Action Script
let baseUrl = 'http://127.0.0.1:52700/wechat-plugin/';
let tmp = '~/.wechat-plugin.tmp';
let timeout = 1;

function run(argument) {
    let index_en = argument.indexOf(';');
    let index_cn = argument.indexOf('；');
    let index;

    if (index_en < 0 && index_cn < 0) {
        index = argument.length;
    }
    else if (index_en < 0) {
        index = index_cn;
    }
    else if (index_cn < 0) {
        index = index_en;
    }
    else {
        index = index_en < index_cn ? index_en : index_cn;
    }

    let keyword = argument.substr(0, index);
    let content = argument.substr(index + 1);
    let result = [];

    if (keyword) {
        let last, response;

        File.exists(tmp) && (last = File.readJSON(tmp));
        if (last) {
            if (keyword == last.keyword || (keyword.startsWith(last.keyword) && !last.result.length)) {
                result = last.result;
                result.forEach(e => e.actionArgument.content = content);
            } else {
                response = true;
            }
        } else {
            response = true;
        }

        if (response) {
            try {
                response = HTTP.getJSON(baseUrl + 'user?keyword=' + encodeURIComponent(keyword), { timeout: timeout });
                if (response) {
                    if (response.error) {
                        LaunchBar.alert(response.error);
                    } else {
                        response.data.forEach(e => result.push({ title: e.title, subtitle: e.subTitle, icon: e.icon, action: 'action', actionArgument: { userId: e.userId, content: content } }));

                        File.writeJSON({ keyword: keyword, result: result }, tmp);
                    }
                }
            }
            catch (e) {
                LaunchBar.alert(e);
            }
        }
    }

    return result;
}

function action(data) {
    if (!data.content || LaunchBar.options.commandKey) {
        LaunchBar.execute('/usr/bin/open', '/Applications/WeChat.app');
        HTTP.post(baseUrl + 'open-session', { body: data, timeout: timeout });
    }

    if (data.content) {
        HTTP.post(baseUrl + 'send-message', { body: data, timeout: timeout });
    }

    LaunchBar.hide();
}