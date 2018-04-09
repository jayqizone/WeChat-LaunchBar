// LaunchBar Action Script
let baseUrl = 'http://127.0.0.1:52700/wechat-plugin/';

function run(argument) {
    let url = baseUrl + 'user?keyword=';

    let index_en = argument.indexOf(';');
    let index_cn = argument.indexOf('；');
    let index;
    if (index_en < 0 && index_cn < 0) {
        index = argument.length;
    }
    else if (index_en < 0) {
        index = index_cn
    }
    else if (index_cn < 0) {
        index = index_en
    }
    else {
        index = index_en < index_cn ? index_en : index_cn;
    }

    let keyword = argument.substr(0, index);
    let content = argument.substr(index + 1);

    let response = HTTP.getJSON(url + encodeURIComponent(keyword));
    let result = [];

    if (response == undefined) {
        LaunchBar.alert('HTTP.getJSON() returned undefined');
        return [];
    }

    if (response.error != undefined) {
        LaunchBar.log('Error in HTTP request: ' + response.error);
        return [];
    }

    response.data.forEach(e => {
        result.push({ title: e.title, subtitle: e.subTitle, icon: e.icon, action: 'action', actionArgument: { userId: e.userId, content: content } })
    });

    return result;
}

function action(data) {
    let url = baseUrl;
    if (data.content) {
        url += 'send-message';
    } else {
        url += 'open-session';
    }

    HTTP.post(url, { body: data });

    LaunchBar.hide();
}
