import List "mo:base/List";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time"

actor {
    public type Message = {
        author: Text;
        text: Text;
        time: Time.Time;
    };

    public type Microblog = actor {
        //follow: shared(Principal) -> async ();
        //follows: shared query() -> async [Principal];
        //post: shared (Text) -> async ();
        posts: shared query (Time.Time) -> async [Message];
        //timeline: shared (Time.Time) -> async [Message];
        //set_name: shared (Text) -> async ();
        get_name: shared () -> async ?Text;
    };

    stable var author_name : Text = "";

    public shared func set_name(name : Text) : async () {
        author_name := name;
    };

    public shared query func get_name() : async ?Text {
        ?author_name;
    };

    stable var followed : List.List<Principal> = List.nil();

    public shared func follow(id: Principal) : async () {
        followed := List.push(id, followed);
    };

    public shared query func follows(): async [Principal] {
        List.toArray(followed);
    };

    stable var messages : List.List<Message> = List.nil();

    public shared func post(data: Text) : async () {
        messages := List.push({text = data; time = Time.now(); author = author_name;}, messages);
    };

    public shared query func posts(since: Time.Time) : async [Message] {
        var result : List.List<Message> = List.nil();
        for (msg in Iter.fromList(messages)) {
            if (msg.time > since) {
                result := List.push(msg, result);
            };
        };
        List.toArray(result);
    };

    public shared func timeline(since: Time.Time) : async [Message] {
        var all : List.List<Message> = List.nil();
        let a = await posts(0);

        for (id in Iter.fromList(followed)) {
            let canister : Microblog = actor(Principal.toText(id));
            let msgs = await canister.posts(since);
            for (msg in Iter.fromArray(msgs)) {
                if (msg.time > since) {
                    all := List.push(msg, all);
                };
            };
        };

        List.toArray(all);
    };

    public shared func follow_name(id: Principal) : async ?Text {
        let canister : Microblog = actor(Principal.toText(id));
        await canister.get_name();
    };

    public shared func follow_posts(id: Principal) : async [Message] {
        let canister : Microblog = actor(Principal.toText(id));
        await canister.posts(0);
    };
}