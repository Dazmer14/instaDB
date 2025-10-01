import requests
import json
import time
from datetime import datetime
import sys
import io

# Force stdout to UTF-8 so Node can read emojis safely
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def scrape_instagram_profile(username):
    """
    Scrapes Instagram profile data and recent posts for a given username using the public web API.
    Returns a tuple: (profile_info, posts)
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-IG-App-ID": "936619743392459",
        "Accept-Language": "en-US,en;q=0.9",
    }

    api_url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}"

    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        data = response.json()
        user_data = data['data']['user']

        profile_info = {
            'id': user_data['id'],
            'username': user_data['username'],
            'full_name': user_data['full_name'],
            'biography': user_data.get('biography', ''),
            'profile_pic_url': user_data['profile_pic_url_hd'],
            'followers_count': user_data['edge_followed_by']['count'],
            'following_count': user_data['edge_follow']['count'],
            'posts_count': user_data['edge_owner_to_timeline_media']['count'],
            'is_private': user_data['is_private'],
            'is_verified': user_data['is_verified'],
            'scraped_at': datetime.now().isoformat()
        }

        posts = []
        edges = user_data['edge_owner_to_timeline_media']['edges']
        for index, edge in enumerate(edges):
            if index >= 10:  # Limit to 10 posts
                break
            node = edge['node']
            post_data = {
                'id': node['id'],
                'shortcode': node['shortcode'],
                'post_url': f"https://instagram.com/p/{node['shortcode']}/",
                'image': node.get('display_url') or node.get('thumbnail_src'),  # <-- frontend reads `post.image`
                'is_video': node['is_video'],
                'likes_count': node['edge_liked_by']['count'],
                'comments_count': node['edge_media_to_comment']['count'],
                'caption': node['edge_media_to_caption']['edges'][0]['node']['text'] if node['edge_media_to_caption']['edges'] else '',
                'taken_at_timestamp': node['taken_at_timestamp']
            }
            posts.append(post_data)
            time.sleep(1)  # respectful delay

        return profile_info, posts

    except requests.exceptions.RequestException:
        return None, None
    except KeyError:
        return None, None
    except json.JSONDecodeError:
        return None, None


if __name__ == "__main__":
    # Use target username from command line if provided
    TARGET_USERNAME = sys.argv[1] if len(sys.argv) > 1 else "instagram"

    profile_info, posts = scrape_instagram_profile(TARGET_USERNAME)

    if profile_info and posts is not None:
        # Output ONLY JSON for backend parsing
        output = {"profile": profile_info, "posts": posts}
        print(json.dumps(output, ensure_ascii=False))
    else:
        # Return empty JSON so backend doesn’t crash
        print(json.dumps({"profile": None, "posts": []}))
