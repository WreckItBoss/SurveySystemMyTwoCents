import MyTwoCents from "../../components/conditions/MyTwoCents/components/Navigator/Navigator";
import NewsOnly from "../../components/conditions/MyTwoCents/components/NewsOnly/NewsOnly";

export default function ExperimentPage({ assignment, onComplete}) {
    if (!assignment) {
        return <p>実験内容を読み込んでいます...</p>;
    }

    if (assignment.condition === "MyTwoCents"){
        return(
            <div>
                <MyTwoCents 
                    topic = {assignment.topic}
                    pattern = {assignment.pattern}
                    onComplete = {onComplete}

                />
            </div>
        );
    }

    if(assignment.condition === "NewsOnly"){
        return(
            <div>
                <NewsOnly 
                    topic = {assignment.topic}
                    onComplete = {onComplete}
                />
            </div>
        );
    }

    return <p>実験条件を読み込めませんでした。</p>;
}