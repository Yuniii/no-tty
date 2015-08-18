$(function() {
    var api = '//jsland-api.herokuapp.com/quiz/all',
        currentQuizNo = 0,
        quizData;

    var $prev = $('#prev'),
        $next = $('#next'),
        $run = $('#run'),
        $quizContent = $('#quizContent'),
        $quizStdAns = $('#quizStdAns'),
        $check = $('#check');

    var codeMirror = CodeMirror(document.getElementById('editor'), {
        value: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world\");\n    }\n}",
        mode: "text/x-java",
        matchBrackets: true,
        lineNumbers: true,
        indentUnit: 4
    });

    function fixNewLineChar(data) {
        if (typeof data.content != 'undefined') 
            data.content = data.content.replace(/\n/g, '<br>');
        if (typeof data.stdout != 'undefined')
            data.stdout = data.stdout.replace(/\\n/g, '\n');
        if (typeof data.ans != 'undefined')
            data.ans = data.ans.replace(/\\n/g, '\n');

        return data;
    }

    function applyQuiz(n) {
        if (typeof quizData == 'undefined')
            return;

        $quizContent.html(quizData[n].content);
        $quizStdAns.html(quizData[n].stdout);
    }

    function checkAns(userAns, stdAns) {
        console.log(userAns);
        console.log(stdAns);
        if (userAns === stdAns || userAns === (stdAns + '\n') || userAns === (stdAns + '\r\n'))
            return true;
        return false;
    }

    function loadQuizData() {
        $.ajax({
            type: 'GET',
            url: api,
            dataType: 'jsonp'
        }).done(function (data) {
            data = fixNewLineChar(data);
            quizData = data;
            sessionStorage.setItem('quiz', JSON.stringify(data));
            applyQuiz(0);
        });
    }

    function go() {
        if ( ! sessionStorage.getItem('quiz')) {
            loadQuizData();
        } else {
            quizData = JSON.parse(sessionStorage.getItem('quiz'));
            applyQuiz(0);
        }
    }

    $run.click(function() {
        $.post('/run', {code: codeMirror.getValue()})
        .done(function (data) {
            $('#stdout').html(data);
            if (checkAns(data, quizData[currentQuizNo].stdout)) {
                $check.html('答案正確！');
            } else {
                $check.html('答案錯誤！');
            }
            UIkit.modal("#stdout-modal").show();
        });
    });

    $next.click(function() {
        applyQuiz(++currentQuizNo);
    });

    $prev.click(function() {
        if (currentQuizNo === 0) {
            return;
        }
        applyQuiz(--currentQuizNo);
    });

    go();

});
